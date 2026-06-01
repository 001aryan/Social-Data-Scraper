import { Request, Response, NextFunction } from 'express';
import { getDb } from '../services/db';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       res.status(400).json({ error: 'Email and password fields are required.' });
       return;
    }

    const db = getDb();

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
       res.status(409).json({ error: 'User with this email already exists' });
       return;
    }

    const hashedPassword = await hashPassword(password);
    const userCount = await db.user.count();
    
    // Auto promote first user to Admin
    const userRole = userCount === 0 ? 'Admin' : 'User';

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        emailVerified: true // Set validated by default for ease of prototyping
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Create system audit entry
    await db.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_REGISTER',
        details: `Registered account: ${newUser.email} (${newUser.role})`,
        ipAddress: req.ip
      }
    });

    // Create system welcome alert
    await db.notification.create({
      data: {
        userId: newUser.id,
        title: 'Welcome to Social Data Scraper!',
        description: 'Your workspace spider engine proxy node allocation is active.',
        type: 'success'
      }
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
       res.status(400).json({ error: 'Email and password are required' });
       return;
    }

    const db = getDb();
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
       res.status(401).json({ error: 'Invalid email or password credentials provided.' });
       return;
    }

    const userPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Save refresh token
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: expiry
      }
    });

    // Write audit details
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `Successfully authenticated from IP workspace`,
        ipAddress: req.ip
      }
    });

    res.json({
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
       res.status(400).json({ error: 'Refresh token is required' });
       return;
    }

    const db = getDb();

    // Verify token exists in database
    const savedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
       res.status(401).json({ error: 'Refresh token is expired or invalid' });
       return;
    }

    const decrypted = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken({
      id: decrypted.id,
      email: decrypted.email,
      role: decrypted.role
    });

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const db = getDb();
      await db.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authUser = (req as any).user;
    if (!authUser) {
      res.status(401).json({ error: 'User context missing' });
      return;
    }

    const db = getDb();
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
