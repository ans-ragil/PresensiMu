import { Request, Response, NextFunction } from 'express';

export const ADMIN_ROLES = ['ADMIN', 'HR', 'SUPER_ADMIN'];

export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Tidak memiliki izin yang cukup'
      });
    }

    next();
  };
};

// Convenience middleware: allows ADMIN, HR, SUPER_ADMIN
export const adminOnly = rbacMiddleware(ADMIN_ROLES);
