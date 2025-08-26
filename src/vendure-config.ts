import 'dotenv/config';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';
import {
  VendureConfig,
  UuidIdStrategy,
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSchedulerPlugin,
  DefaultSearchPlugin,
} from '@vendure/core';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import { HardenPlugin } from '@vendure/harden-plugin';
import {
  EmailPlugin,
  defaultEmailHandlers,
  FileBasedTemplateLoader,
} from '@vendure/email-plugin';

import { SiteSettingsPlugin } from './plugins/site-settings/site-settings.plugin';

const trustProxyMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const before = req.app.get('trust proxy');
  req.app.set('trust proxy', 1); // Railway-friendly; harmless locally
  if (before !== 1) {
    console.log('[startup] set express trust proxy -> 1 (was:', before, ')');
  }
  next();
};

// ---- toggle
const IS_DEV = process.env.APP_ENV === 'dev' || process.env.NODE_ENV !== 'production';
const serverPort = +(process.env.PORT || 3000);

const assetsDir = path.join(
  path.dirname(require.resolve('@vendure/create/assets/products.csv')),
  'images'
);

// optional: override in prod with env
const STOREFRONT_ORIGIN =
  process.env.STOREFRONT_ORIGIN ||
  'https://vendure-storefront-production-f077.up.railway.app';

export const config: VendureConfig = {
  entityOptions: { entityIdStrategy: new UuidIdStrategy() },

  apiOptions: {
    port: serverPort,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // keep your playground choice; GraphiQL UI is enabled only in dev below
    shopApiPlayground: true,

    // 🔑 CORS: wide-open for localhost in dev; locked to storefront in prod
    cors: IS_DEV
      ? {
        origin: [
          'http://localhost:3000', 'http://127.0.0.1:3000', // Vendure server
          'http://localhost:3002', 'http://127.0.0.1:3002', // Admin UI dev port
          'http://localhost:5173', 'http://127.0.0.1:5173', // Vite/Remix dev (if used)
        ],
        credentials: true,
      }
      : {
        origin: [STOREFRONT_ORIGIN],
        credentials: true,
      },

    middleware: [{ route: '/', handler: trustProxyMiddleware }],
    ...(IS_DEV ? { adminApiDebug: true, shopApiDebug: true } : {}),
  },

  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET || 'dev-secret',
      sameSite: 'lax', // good for local + prod
      // secure left false here; Railway terminates TLS before Express
    },
  },

  importExportOptions: { importAssetsDir: assetsDir },

  dbConnectionOptions: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: false,
    synchronize: process.env.DB_SYNCHRONIZE === 'true', // keep false usually
    // 👇 add these lines
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    migrationsTableName: 'vendure_migrations',
  },


  paymentOptions: { paymentMethodHandlers: [dummyPaymentHandler] },

  customFields: {},

  plugins: [
    // 🧪 GraphiQL only in dev: /graphiql, /graphiql/shop, /graphiql/admin
    ...(IS_DEV ? [GraphiqlPlugin.init()] : []),

    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: process.env.ASSET_UPLOAD_DIR || path.join(__dirname, '../static/assets'),
    }),

    DefaultSchedulerPlugin.init(),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),

    EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(
        path.join(process.cwd(), 'static/email/templates'),
      ),
      globalTemplateVars: {
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: process.env.VERIFY_EMAIL_URL,
        passwordResetUrl: process.env.RESET_PASSWORD_URL,
        changeEmailAddressUrl: process.env.CHANGE_EMAIL_URL,
      },
      ...(IS_DEV
        ? {
          devMode: true as const,
          outputPath: path.join(process.cwd(), 'static/email/test-emails'),
          route: 'mailbox',
        }
        : {
          transport: {
            type: 'smtp',
            host: process.env.SMTP_HOST,
            port: +(process.env.SMTP_PORT || 587),
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            // secure: true, // if using port 465
          },
        }),
    }),

    // In dev, Admin UI points to the same origin (/admin-api); in prod, to Railway host
    AdminUiPlugin.init({
      route: 'admin',
      port: serverPort + 2,
      adminUiConfig: IS_DEV
        ? {
          adminApiPath: 'admin-api', // relative; same origin
          tokenMethod: 'cookie',
        }
        : {
          apiHost: `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`,
          apiPort: 443,
          adminApiPath: 'admin-api',
          tokenMethod: 'cookie',
        },
    }),

    HardenPlugin.init({
      maxQueryComplexity: 500,
      apiMode: IS_DEV ? 'dev' : 'prod',
    }),

    SiteSettingsPlugin,
  ],
};
