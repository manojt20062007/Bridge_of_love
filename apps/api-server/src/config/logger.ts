import winston from 'winston';

const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'panNumber', 'donorPan', 'secret', 'authorization'];

const maskSensitiveData = winston.format((info) => {
  const mask = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(mask);
    const copy = { ...obj };
    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        copy[key] = '***MASKED***';
      } else if (typeof copy[key] === 'object') {
        copy[key] = mask(copy[key]);
      }
    }
    return copy;
  };

  return mask(info);
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    maskSensitiveData(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});
