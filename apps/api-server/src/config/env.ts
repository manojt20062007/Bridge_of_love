import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
  API_URL: process.env.API_URL || 'http://localhost:5000/api/v1',
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5433/bridge_of_love?schema=public',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'bridge_of_love_access_secret_production_ready_token_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'bridge_of_love_refresh_secret_production_ready_token_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_bol_mock_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_bol_mock_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'bol_mock_webhook_secret',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'noreply@bridgeoflove.org',
  SMTP_PASS: process.env.SMTP_PASS || 'secret_smtp_password',
  SMTP_FROM: process.env.SMTP_FROM || '"Bridge Of Love Trust" <receipts@bridgeoflove.org>',

  TRUST_NAME: process.env.TRUST_NAME || 'Bridge Of Love Charitable Trust',
  TRUST_TAGLINE: process.env.TRUST_TAGLINE || 'Connecting compassionate hearts with people in need',
  TRUST_REG_NO: process.env.TRUST_REG_NO || 'BOL/TN/2021/004921',
  TRUST_PAN: process.env.TRUST_PAN || 'AAATB1234F',
  TRUST_80G_REG: process.env.TRUST_80G_REG || 'AAATB1234FF20214',
  TRUST_12A_REG: process.env.TRUST_12A_REG || 'AAATB1234FE20213',
  TRUST_ADDRESS: process.env.TRUST_ADDRESS || 'Plot No. 42, Karuna Nagar, 3rd Main Road, Anna Nagar West, Chennai, Tamil Nadu - 600040',
  TRUST_PHONE: process.env.TRUST_PHONE || '+91 94441 23456',
  TRUST_EMAIL: process.env.TRUST_EMAIL || 'contact@bridgeoflove.org',
};
