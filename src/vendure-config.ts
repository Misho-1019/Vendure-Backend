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

const IS_DEV =
  process.env.APP_ENV === 'dev' ||
  process.env.NODE_ENV !== 'production';

const serverPort = +(process.env.PORT || 3000);

export const config: VendureConfig = {
  entityOptions: {
    entityIdStrategy: new UuidIdStrategy(),
  },

  apiOptions: {
    port: serverPort,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    trustProxy: IS_DEV ? false : 1,
    ...(IS_DEV
      ? {
          adminApiDebug: true,
          shopApiDebug: true,
        }
      : {}),
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

  dbConnectionOptions: {
    type: 'postgres',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
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
        path.join(__dirname, '../static/email/templates')
      ),
      globalTemplateVars: {
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: process.env.VERIFY_EMAIL_URL,
        passwordResetUrl: process.env.RESET_PASSWORD_URL,
        changeEmailAddressUrl: process.env.CHANGE_EMAIL_URL,
      },
      ...(IS_DEV
        ? {
            // Literal type fixes the TS error
            devMode: true as const,
            outputPath: path.join(
              __dirname,
              '../static/email/test-emails'
            ),
            route: 'mailbox',
          }
        : {
            // Configure SMTP for production (or remove EmailPlugin until you need it)
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
