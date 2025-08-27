import { Query, Resolver } from '@nestjs/graphql';
import { Allow, Permission, Ctx, RequestContext } from '@vendure/core';
import { SiteSettingsService } from '../../services/site-settings.service';

@Resolver()
export class SiteSettingsShopResolver {
  constructor(private service: SiteSettingsService) {}

  @Query()
  @Allow(Permission.Public)
  async siteTheme(@Ctx() ctx: RequestContext) {
    const s = await this.service.get(ctx);
    return { title: s.title, primaryColor: s.primaryColor, accountHeading: s.accountHeading };
  }
}
