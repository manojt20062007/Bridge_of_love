import { Request, Response, NextFunction } from 'express';
import { RoleName, PermissionName } from '@bridge-of-love/shared-types';

/**
 * Require at least one matching role
 */
export function requireRole(...allowedRoles: RoleName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
        },
      });
    }

    next();
  };
}

/**
 * Require at least one matching permission
 */
export function requirePermission(...requiredPermissions: PermissionName[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    // Super Admin or Admin role bypass
    if (req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasPermission = req.user.permissions.some((p) => requiredPermissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Insufficient permissions.`,
        },
      });
    }

    next();
  };
}

/**
 * Enforce that member can only view their own records unless they are an admin
 */
export function requireSelfOrAdmin(resourceUserIdGetter: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const isAdmin = req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN');
    if (isAdmin) {
      return next();
    }

    const targetUserId = resourceUserIdGetter(req);
    if (req.user.id !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You cannot view or modify another member\'s personal records.',
        },
      });
    }

    next();
  };
}
