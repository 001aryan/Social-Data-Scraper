import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
}

export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, config.jwtSecret) as UserPayload;
}

export function verifyRefreshToken(token: string): UserPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as UserPayload;
}
