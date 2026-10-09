import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { prisma } from '../config/db.js';
import { RoleName, PermissionName } from '@bridge-of-love/shared-types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: RoleName[];
  permissions: PermissionName[];
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function generateAccessToken(payload: { id: string; email: string; roles: string[] }): string {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        },
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User account not found',
        },
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact trust administration.',
        },
      });
    }

    const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name as RoleName);
    const permissionSet = new Set<PermissionName>();

    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.name as PermissionName);
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName || user.email.split('@')[0],
      roles,
      permissions: Array.from(permissionSet),
      status: user.status,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please refresh your session.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authorization token',
      },
    });
  }
}
