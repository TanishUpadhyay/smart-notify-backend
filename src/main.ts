import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { CONFIG_DICTIONARY } from './config/constants';

async function bootstrap() {
  //Add logger
  const logger = new Logger('Bootstrap');
  Logger.log('Starting application...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true
  });
  //set global prefix
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');

  //security headers
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true
    })
  );

  //request id middleware
  app.use((req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    req.id = uuidv4();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    next();
  });

  //Add Rate Limiting

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: express.Request /*, res*/) => {
        return (req.headers['x-device-id'] as string) || '';
      },
      handler: (req: express.Request, res: express.Response /*, next*/) => {
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests from this IP, please try again later.',
          error: 'Too Many Requests'
        });
      }
    })
  );

  //cors
  app.enableCors({
    origin:
      configService
        .get<string>(CONFIG_DICTIONARY.ALLOWED_ORIGINS)
        ?.split(',') || '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Device-Id'
    ],
    exposedheaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 3600
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const port = configService.get(CONFIG_DICTIONARY.PORT) || 3200;

  try {
    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
  } catch (err) {
    logger.error('Error starting application', err);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Fatal error during bootstrap', err);
  process.exit(1);
});
