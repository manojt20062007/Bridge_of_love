import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

export interface RecordAuditParams {
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  static async record(params: RecordAuditParams) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          userName: params.userName,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
          newValues: params.newValues ? JSON.stringify(params.newValues) : null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
      logger.info(`Audit logged: [${params.action}] on ${params.entityType}:${params.entityId} by ${params.userName || 'SYSTEM'}`);
    } catch (err) {
      logger.error('Failed to create audit log entry:', err);
    }
  }
}
