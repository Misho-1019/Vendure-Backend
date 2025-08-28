import { Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import {
  assertFound,
  CustomFieldRelationService,
  RelationPaths,
  RequestContext,
  TransactionalConnection,
  patchEntity,
} from '@vendure/core';
import { SiteSettings } from '../entities/site-settings.entity';
import { CreateSiteSettingsInput, UpdateSiteSettingsInput } from '../types';

@Injectable()
export class SiteSettingsService {
  constructor(
    private connection: TransactionalConnection,
    private customFieldRelationService: CustomFieldRelationService,
  ) {}

  async findOne(
    ctx: RequestContext,
    id: ID,
    relations?: RelationPaths<SiteSettings>,
  ): Promise<SiteSettings | null> {
    return this.connection.getRepository(ctx, SiteSettings).findOne({
      where: { id },
      relations,
    });
  }

  async findByKey(
    ctx: RequestContext,
    key: string,
    relations?: RelationPaths<SiteSettings>,
  ): Promise<SiteSettings | null> {
    return this.connection.getRepository(ctx, SiteSettings).findOne({
      where: { key },
      relations,
    });
  }

  async get(ctx: RequestContext): Promise<SiteSettings> {
    // enforce singleton by key = 'default'
    const repo = this.connection.getRepository(ctx, SiteSettings);
    const existing = await repo.findOne({ where: { key: 'default' } });
    if (existing) return existing;
    return this.create(ctx, {
      key: 'default',
      title: 'My Store',
      primaryColor: '#3b82f6',
      accountHeading: 'My Account',
    });
  }

  async create(ctx: RequestContext, input: CreateSiteSettingsInput): Promise<SiteSettings> {
    const entity = await this.connection.getRepository(ctx, SiteSettings).save(new SiteSettings(input));
    await this.customFieldRelationService.updateRelations(ctx, SiteSettings, input, entity);
    return assertFound(this.findOne(ctx, entity.id));
  }

  async update(ctx: RequestContext, input: UpdateSiteSettingsInput): Promise<SiteSettings> {
    const entity = await this.connection.getEntityOrThrow(ctx, SiteSettings, input.id);
    patchEntity(entity, input);
    await this.connection.getRepository(ctx, SiteSettings).save(entity, { reload: false });
    await this.customFieldRelationService.updateRelations(ctx, SiteSettings, input, entity);
    return assertFound(this.findOne(ctx, entity.id));
  }

  async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
    const entity = await this.connection.getEntityOrThrow(ctx, SiteSettings, id);
    try {
      await this.connection.getRepository(ctx, SiteSettings).remove(entity);
      return { result: DeletionResult.DELETED };
    } catch (e: any) {
      return { result: DeletionResult.NOT_DELETED, message: e.toString() };
    }
  }
}
