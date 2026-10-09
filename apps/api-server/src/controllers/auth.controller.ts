import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { RegisterSchema, LoginSchema, ChangePasswordSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@bridge-of-love/validation';
import { EmailService } from '../services/email.service.js';
import { AuditService } from '../services/audit.service.js';
import { RoleName, PermissionName } from '@bridge-of-love/shared-types';

export class AuthController {
  static async register(req: Request, res: Response) {
    const validated = RegisterSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email address already exists' },
      });
    }

    const memberRole = await prisma.role.findUnique({
      where: { name: 'MEMBER' },
    });

    if (!memberRole) {
      return res.status(500).json({
        success: false,
        error: { code: 'ROLE_ERROR', message: 'Default MEMBER role not initialized' },
      });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        mobile: validated.mobile,
        passwordHash,
        status: 'ACTIVE',
        isEmailVerified: true, // auto-verified for frictionless member onboarding
        profile: {
          create: {
            fullName: validated.fullName,
            address: validated.address || null,
            city: validated.city || null,
            state: validated.state || null,
            postalCode: validated.postalCode || null,
            panNumber: validated.panNumber || null,
          },
        },
        userRoles: {
          create: {
            roleId: memberRole.id,
          },
        },
      },
      include: {
        profile: true,
        userRoles: {
          include: { role: true },
        },
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roles: ['MEMBER'],
    });

    const refreshToken = generateRefreshToken({ id: user.id });
    const tokenHash = await bcrypt.hash(refreshToken, 8);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set secure HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditService.record({
      userId: user.id,
      userName: validated.fullName,
      action: 'MEMBER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      newValues: { email: user.email, mobile: user.mobile },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    EmailService.sendWelcomeEmail(user.email, validated.fullName).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to Bridge Of Love!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          roles: ['MEMBER'],
          permissions: [],
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  }

  static async login(req: Request, res: Response) {
    const validated = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
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
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Please contact trust administration.' },
      });
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name as RoleName);
    const permissionSet = new Set<PermissionName>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.name as PermissionName);
      }
    }
    const permissions = Array.from(permissionSet);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      roles,
    });

    const refreshToken = generateRefreshToken({ id: user.id });
    const tokenHash = await bcrypt.hash(refreshToken, 8);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await AuditService.record({
      userId: user.id,
      userName: user.profile?.fullName || user.email,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          roles,
          permissions,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  }

  static async refreshToken(req: Request, res: Response) {
    const rawToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REQUIRED', message: 'Refresh token is required' },
      });
    }

    try {
      const decoded = jwt.verify(rawToken, ENV.JWT_REFRESH_SECRET) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          profile: true,
          userRoles: {
            include: { role: true },
          },
        },
      });

      if (!user || user.status === 'SUSPENDED') {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authorized' },
        });
      }

      const roles = user.userRoles.map((ur) => ur.role.name as RoleName);
      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
        roles,
      });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' },
      });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async logoutAll(req: Request, res: Response) {
    if (req.user?.id) {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.id },
        data: { isRevoked: true },
      });
      await prisma.session.deleteMany({
        where: { userId: req.user.id },
      });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  }

  static async getMe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name as RoleName);
    const permissionSet = new Set<PermissionName>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.name as PermissionName);
      }
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile,
        roles,
        permissions: Array.from(permissionSet),
      },
    });
  }

  static async changePassword(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }

    const validated = ChangePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const isMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INCORRECT_PASSWORD', message: 'Current password does not match' },
      });
    }

    const newHash = await bcrypt.hash(validated.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await AuditService.record({
      userId: user.id,
      userName: req.user.fullName,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }

  static async forgotPassword(req: Request, res: Response) {
    const validated = ForgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: validated.email } });

    if (user) {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      EmailService.sendPasswordResetEmail(user.email, token).catch(() => {});
    }

    // Always respond with success to prevent user enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been sent.',
    });
  }

  static async resetPassword(req: Request, res: Response) {
    const validated = ResetPasswordSchema.parse(req.body);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validated.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Reset token is invalid or has expired' },
      });
    }

    const newHash = await bcrypt.hash(validated.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  }
}
