import { Request, Response, NextFunction } from 'express';
import { getDb } from '../services/db';

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, platform, type, target, limit } = req.body;
    const authUser = (req as any).user;

    if (!platform || !type || !target) {
       res.status(400).json({ error: 'Missing scanning criteria inputs (platform, type, and target are all required).' });
       return;
    }

    const db = getDb();
    
    // Create new job
    const newJob = await db.job.create({
      data: {
        userId: authUser.id,
        name: name || `Spider Scraper - ${platform}/${type}`,
        platform,
        type,
        target,
        limit: limit ? parseInt(String(limit), 10) : 100,
        status: 'queued',
        progress: 0,
        duration: 0,
      }
    });

    // Write initial log
    await db.jobLog.create({
      data: {
        jobId: newJob.id,
        message: `[${new Date().toLocaleTimeString()}] Scraper job requested and inserted into queue pipeline.`
      }
    });

    // Auditing
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'JOB_CREATE',
        details: `Created job ${newJob.id}: Platform=${platform}, Target="${target}"`,
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      message: 'Job queued successfully',
      job: newJob
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authUser = (req as any).user;
    const { platform, status, search, orderBy = 'createdAt', orderType = 'desc', page = '1', limit = '10' } = req.query;

    const db = getDb();
    const parsedPage = parseInt(String(page), 10) || 1;
    const parsedLimit = parseInt(String(limit), 10) || 10;
    const skip = (parsedPage - 1) * parsedLimit;

    // Filter building
    const whereClause: any = {
      userId: authUser.id,
    };

    if (platform) {
      whereClause.platform = String(platform);
    }
    if (status) {
      whereClause.status = String(status);
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { target: { contains: String(search) } },
      ];
    }

    const [total, items] = await Promise.all([
      db.job.count({ where: whereClause }),
      db.job.findMany({
        where: whereClause,
        orderBy: { [String(orderBy)]: String(orderType) === 'asc' ? 'asc' : 'desc' },
        skip,
        take: parsedLimit,
        include: {
          logs: { take: 10, orderBy: { createdAt: 'desc' } }
        }
      })
    ]);

    res.json({
      jobs: items,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const job = await db.job.findUnique({
      where: { id },
      include: {
        logs: { orderBy: { createdAt: 'asc' } },
        results: true
      }
    });

    if (!job || job.userId !== authUser.id) {
       res.status(404).json({ error: 'Scraper job record not found' });
       return;
    }

    // Parse data safely for UI responses
    const formattedResults = job.results.map(r => {
      try {
        return JSON.parse(r.data);
      } catch (e) {
        return r.data;
      }
    }).flat();

    res.json({
      job: {
        ...job,
        results: formattedResults
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.userId !== authUser.id) {
       res.status(404).json({ error: 'Job not found' });
       return;
    }

    if (job.status !== 'queued' && job.status !== 'running') {
       res.status(400).json({ error: 'Only jobs in queued or running status can be aborted.' });
       return;
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    await db.jobLog.create({
      data: {
        jobId: id,
        message: `[${new Date().toLocaleTimeString()}] Scraper aborted by user command request.`
      }
    });

    // Auditing
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'JOB_CANCEL',
        details: `Cancelled active scanner job: ${id}`,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Job cancellation requested', job: updatedJob });
  } catch (error) {
    next(error);
  }
}

export async function retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.userId !== authUser.id) {
       res.status(404).json({ error: 'Job not found' });
       return;
    }

    if (job.status !== 'failed' && job.status !== 'cancelled') {
       res.status(400).json({ error: 'Only failed or cancelled scraper workflows can be retried.' });
       return;
    }

    // Reset status and queue
    const updatedJob = await db.job.update({
      where: { id },
      data: {
        status: 'queued',
        progress: 0,
        resultsCount: 0,
        completedAt: null,
      }
    });

    // Delete old logs and write a start log
    await db.jobLog.deleteMany({ where: { jobId: id } });
    await db.jobResult.deleteMany({ where: { jobId: id } });

    await db.jobLog.create({
      data: {
        jobId: id,
        message: `[${new Date().toLocaleTimeString()}] Retrying scraper job. Initializing back transition queue.`
      }
    });

    // Auditing
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'JOB_RETRY',
        details: `Retried failed/cancelled scraper job: ${id}`,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Scraper job successfully requeued', job: updatedJob });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const authUser = (req as any).user;
    const db = getDb();

    const job = await db.job.findUnique({ where: { id } });
    if (!job || job.userId !== authUser.id) {
       res.status(404).json({ error: 'Job not found' });
       return;
    }

    await db.job.delete({ where: { id } });

    // Auditing
    await db.auditLog.create({
      data: {
        userId: authUser.id,
        action: 'JOB_DELETE',
        details: `Deleted scraper job record and historic outputs: ${id}`,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Job record permanently wiped.' });
  } catch (error) {
    next(error);
  }
}
