import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { SiteSettings } from './entities/site-settings.entity';
import { SiteSettingsService } from './services/site-settings.service';
import { adminApiExtensions } from './api/api-extensions/admin.schema';
import { SiteSettingsAdminResolver } from './api/api-extensions/admin.resolver';
import { shopApiExtensions } from './api/api-extensions/shop.schema';
import { SiteSettingsShopResolver } from './api/api-extensions/shop.resolver';

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [SiteSettings],
  providers: [SiteSettingsService],
  adminApiExtensions: { schema: adminApiExtensions, resolvers: [SiteSettingsAdminResolver] },
  shopApiExtensions:  { schema: shopApiExtensions,  resolvers: [SiteSettingsShopResolver]  },
  dashboard: './dashboard/index.tsx',
})
export class SiteSettingsPlugin {}
