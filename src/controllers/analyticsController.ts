import { Request, Response, NextFunction } from 'express';
import { getDb } from '../services/db';
import { config } from '../config/index';

export async function getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authUser = (req as any).user;
    const db = getDb();

    // 1. Gather counts
    const totalJobsCount = await db.job.count({ where: { userId: authUser.id } });
    const successCount = await db.job.count({ where: { userId: authUser.id, status: 'completed' } });
    const failedCount = await db.job.count({ where: { userId: authUser.id, status: 'failed' } });
    const runningCount = await db.job.count({ where: { userId: authUser.id, status: 'running' } });

    // 2. Fetch recent jobs
    const recentJobs = await db.job.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      take: 6
    });

    // 3. Platform aggregates
    const platforms = ['twitter', 'instagram', 'linkedin', 'youtube'];
    const platformBreakdown: Record<string, number> = {};

    for (const p of platforms) {
      const counts = await db.job.count({
        where: { userId: authUser.id, platform: p }
      });
      platformBreakdown[p] = counts;
    }

    // 4. Calculate approximate lifetime data scraped
    const totalItemsScraped = await db.job.aggregate({
      where: { userId: authUser.id, status: 'completed' },
      _sum: {
        resultsCount: true
      }
    });

    const sumScraped = totalItemsScraped._sum.resultsCount || 0;
    // Assume 3.5 KB average metadata payload per text/image block item
    const estGigabytes = parseFloat(((sumScraped * 3.5) / 1024 / 1024).toFixed(3));

    // Calculate metrics ratios
    const successRatio = totalJobsCount > 0 ? parseFloat(((successCount / totalJobsCount) * 100).toFixed(2)) : 100;

    // Timeline logs
    const activities = await db.auditLog.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const apiConnections = {
      youtube: !!(process.env.YOUTUBE_API_KEY || config.youtubeApiKey),
      twitter: !!(process.env.TWITTER_BEARER_TOKEN || config.twitterBearerToken),
      scrapingbee: !!(process.env.SCRAPINGBEE_API_KEY || config.scrapingbeeApiKey)
    };

    res.json({
      summary: {
        totalJobs: totalJobsCount,
        activeJobs: runningCount,
        successJobs: successCount,
        failedJobs: failedCount,
        successRate: `${successRatio}%`,
        dataScraped: `${estGigabytes} MB`,
        totalScrapedCount: sumScraped,
      },
      platforms: platformBreakdown,
      apiConnections,
      recentJobs,
      activities
    });
  } catch (error) {
    next(error);
  }
}

export async function getTelemetryMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const db = getDb();
    
    // Group metrics by day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const jobs = await db.job.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        createdAt: true,
        status: true,
        platform: true,
        duration: true,
        resultsCount: true
      }
    });

    // Map timestamps to days
    const dailyMetricsMap: Record<string, { total: number; completed: number; failed: number; scrapedCount: number; durationSum: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isDateStr = d.toISOString().split('T')[0];
      dailyMetricsMap[isDateStr] = { total: 0, completed: 0, failed: 0, scrapedCount: 0, durationSum: 0 };
    }

    jobs.forEach(j => {
      const dateStr = j.createdAt.toISOString().split('T')[0];
      if (dailyMetricsMap[dateStr]) {
        dailyMetricsMap[dateStr].total += 1;
        if (j.status === 'completed') {
          dailyMetricsMap[dateStr].completed += 1;
          dailyMetricsMap[dateStr].scrapedCount += j.resultsCount || 0;
          dailyMetricsMap[dateStr].durationSum += j.duration || 0;
        } else if (j.status === 'failed') {
          dailyMetricsMap[dateStr].failed += 1;
        }
      }
    });

    const timelineData = Object.entries(dailyMetricsMap).map(([day, values]) => ({
      day,
      ...values
    })).reverse();

    res.json({
      timeline: timelineData,
      totalTracked: jobs.length,
    });
  } catch (error) {
    next(error);
  }
}
