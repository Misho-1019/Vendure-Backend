import 'dotenv/config';
import path from 'path';
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

import type { Request, Response, NextFunction } from 'express';

const trustProxyMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // trust Railway/ingress in prod; keep false in dev
  req.app.set('trust proxy', IS_DEV ? false : 1);
  next();
};

const IS_DEV =
  process.env.APP_ENV === 'dev' ||
  process.env.NODE_ENV !== 'production';

const serverPort = +(process.env.PORT || 3000);

const assetsDir = path.join(
  path.dirname(require.resolve('@vendure/create/assets/products.csv')),
  'images'
);

export const config: VendureConfig = {
  entityOptions: {
    entityIdStrategy: new UuidIdStrategy(),
  },

  apiOptions: {
    port: serverPort,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    middleware: [
      { route: '/', handler: trustProxyMiddleware }, // 👈 must be first
      // ... keep any other middleware you already had here
    ],
    ...(IS_DEV ? { adminApiDebug: true, shopApiDebug: true } : {}),
  },

  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },
  importExportOptions: {
    importAssetsDir: assetsDir,
  },

  dbConnectionOptions: {
    type: 'postgres',
    synchronize: process.env.DB_SYNCHRONIZE === 'true', // ✅ only while seeding!
    logging: false,
    url: process.env.DATABASE_URL, // <--- easiest
  },

  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },

  // Add custom fields here later if needed
  customFields: {},

  plugins: [
    // Enable GraphiQL only in dev to avoid exposing it in prod
    ...(IS_DEV ? [GraphiqlPlugin.init()] : []),

    AssetServerPlugin.init({
      route: 'assets',
      assetUploadDir: process.env.ASSET_UPLOAD_DIR || path.join(__dirname, '../static/assets'),
      // keep your other options as-is
    }),

    DefaultSchedulerPlugin.init(),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),

    // Email plugin: dev mailbox locally; real SMTP in prod
    EmailPlugin.init({
      handlers: defaultEmailHandlers,
      templateLoader: new FileBasedTemplateLoader(
        path.join(process.cwd(), 'static/email/templates')
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
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
              // secure: true, // if using port 465
            },
          }),
    }),

    // Admin UI served by the same server.
    // `port` is required by the plugin type; using serverPort+2 is the usual pattern
    // and works fine on Railway (it’s internal to the container).
    AdminUiPlugin.init({
      route: 'admin',
      port: serverPort + 2, // required by the plugin type; internal-only
      adminUiConfig: {
        // Point the Admin UI (in the browser) to your public HTTPS domain
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
  ],
};
