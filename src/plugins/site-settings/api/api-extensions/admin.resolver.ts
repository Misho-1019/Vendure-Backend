import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Permission, Ctx, RequestContext } from '@vendure/core';
import { SiteSettingsService } from '../../services/site-settings.service';

@Resolver()
export class SiteSettingsAdminResolver {
  constructor(private service: SiteSettingsService) {}

  @Query()
  @Allow(Permission.ReadSettings, Permission.UpdateSettings)
  async siteSettings(@Ctx() ctx: RequestContext) {
    return this.service.get(ctx);
  }

  @Mutation()
  @Allow(Permission.UpdateSettings)
  async updateSiteSettings(
    @Ctx() ctx: RequestContext,
    @Args('input') input: any
  ) {
    return this.service.update(ctx, input);
  }
}
