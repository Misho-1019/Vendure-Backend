import { defineDashboardExtension } from '@vendure/dashboard';
import { siteSettingsRoute } from './site-settings.page';

export default defineDashboardExtension({
  routes: [siteSettingsRoute],
});

