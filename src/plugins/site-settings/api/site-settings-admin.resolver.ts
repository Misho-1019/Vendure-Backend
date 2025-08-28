import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    PaginatedList,
    RequestContext,
    Transaction,
    Relations,
    VendureEntity,
    ID,
    TranslationInput,
    ListQueryOptions,
    RelationPaths,
} from '@vendure/core';
import { SiteSettingsService } from '../services/site-settings.service';
import { SiteSettings } from '../entities/site-settings.entity';
import { CreateSiteSettingsInput, UpdateSiteSettingsInput } from '../types';

@Resolver()
export class SiteSettingsAdminResolver {
    constructor(private siteSettingsService: SiteSettingsService) { }

    @Query()
    @Allow(Permission.SuperAdmin)
    async siteSettings(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(SiteSettings) relations: RelationPaths<SiteSettings>,
    ): Promise<SiteSettings | null> {
        return this.siteSettingsService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.SuperAdmin) // or your custom permission later
    async siteSettingsByKey(
        @Ctx() ctx: RequestContext,
        @Args() args: { key: string },
        @Relations(SiteSettings) relations: RelationPaths<SiteSettings>,
    ): Promise<SiteSettings | null> {
        return this.siteSettingsService.findByKey(ctx, args.key, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async createSiteSettings(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateSiteSettingsInput },
    ): Promise<SiteSettings> {
        return this.siteSettingsService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async updateSiteSettings(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateSiteSettingsInput },
    ): Promise<SiteSettings> {
        return this.siteSettingsService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.SuperAdmin)
    async deleteSiteSettings(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.siteSettingsService.delete(ctx, args.id);
    }
}
