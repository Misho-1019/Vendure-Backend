import { Injectable } from "@nestjs/common";
import { DeletionResponse, DeletionResult, LanguageCode } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject, ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    assertFound,
    CustomFieldRelationService,
    HasCustomFields,
    ListQueryBuilder,
    ListQueryOptions,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    Translatable,
    TranslatableSaver,
    Translated,
    Translation,
    TranslationInput,
    TranslatorService,
    VendureEntity,
    patchEntity,
} from '@vendure/core';
import { SiteSettings } from '../entities/site-settings.entity';
import { CreateSiteSettingsInput, UpdateSiteSettingsInput } from '../types';

@Injectable()
export class SiteSettingsService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService,
    ) { }

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<SiteSettings>,
        relations?: RelationPaths<SiteSettings>,
    ): Promise<PaginatedList<SiteSettings>> {
        return this.listQueryBuilder
            .build(SiteSettings, options, {
                relations,
                ctx,
            }
            ).getManyAndCount().then(([items, totalItems]) => {
                return {
                    items,
                    totalItems,
                }
            }
            );
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<SiteSettings>,
    ): Promise<SiteSettings | null> {
        return this.connection
            .getRepository(ctx, SiteSettings)
            .findOne({
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
        // try to fetch the first settings row
        const list = await this.findAll(ctx, { take: 1 });
        if (list.totalItems > 0) {
            return list.items[0];
        }
        // if none exists, create a default one
        return this.create(ctx, {
            key: 'default',
            title: 'My Store',
            primaryColor: '#3b82f6',
            accountHeading: 'My Account',
        });
    }


    async create(ctx: RequestContext, input: CreateSiteSettingsInput): Promise<SiteSettings> {
        const newEntityInstance = new SiteSettings(input);
        const newEntity = await this.connection.getRepository(ctx, SiteSettings).save(newEntityInstance);
        await this.customFieldRelationService.updateRelations(ctx, SiteSettings, input, newEntity);
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdateSiteSettingsInput): Promise<SiteSettings> {
        const entity = await this.connection.getEntityOrThrow(ctx, SiteSettings, input.id);
        const updatedEntity = patchEntity(entity, input);
        await this.connection.getRepository(ctx, SiteSettings).save(updatedEntity, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, SiteSettings, input, updatedEntity);
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, SiteSettings, id);
        try {
            await this.connection.getRepository(ctx, SiteSettings).remove(entity);
            return {
                result: DeletionResult.DELETED,
            };
        } catch (e: any) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
}
