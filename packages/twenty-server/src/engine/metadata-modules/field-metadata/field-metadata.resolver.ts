import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  ForbiddenError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import {
  FIELD_FILTER_COLUMN_BY_FILTER_FIELD,
  FieldFilterInput,
} from 'src/engine/metadata-modules/field-metadata/dtos/field-filter.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldConnectionDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata-connection.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { UpdateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { applyMetadataFilterToQueryBuilder } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';
import { findManyWithCursorPagination } from 'src/engine/metadata-modules/pagination/utils/find-many-with-cursor-pagination.util';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

// Keep @Parent() structurally typed so ResolverValidationPipe does not validate
// FieldMetadataDTO date decorators on already-loaded parent records.
type FieldMetadataStandardOverrideParent = Pick<
  FieldMetadataDTO,
  'label' | 'description' | 'icon' | 'overrides' | 'applicationId'
>;

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@MetadataResolver(() => FieldMetadataDTO)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class FieldMetadataResolver {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly i18nService: I18nService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  @UseGuards(NoPermissionGuard)
  @Query(() => FieldConnectionDTO)
  async fields(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('paging', {
      type: () => CursorPagingInput,
      defaultValue: { first: 10 },
      description: 'Limit or page results.',
    })
    paging: CursorPagingInput,
    @Args('filter', {
      type: () => FieldFilterInput,
      defaultValue: {},
      description: 'Specify to filter the records returned.',
    })
    filter: FieldFilterInput,
  ): Promise<CursorConnection<FieldMetadataEntity>> {
    const queryBuilder = this.fieldMetadataRepository
      .createQueryBuilder('fieldMetadata')
      .where('"fieldMetadata"."workspaceId" = :workspaceId', { workspaceId });

    applyMetadataFilterToQueryBuilder({
      whereBuilder: queryBuilder,
      alias: 'fieldMetadata',
      filter,
      columnByFilterField: FIELD_FILTER_COLUMN_BY_FILTER_FIELD,
    });

    return findManyWithCursorPagination({
      queryBuilder,
      alias: 'fieldMetadata',
      paging,
      defaultResultSize: 10,
      maxResultsSize: 1000,
    });
  }

  @UseGuards(NoPermissionGuard)
  @Query(() => FieldMetadataDTO)
  async field(
    @Args('id', {
      type: () => UUIDScalarType,
      description: 'The id of the record to find.',
    })
    id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<FieldMetadataEntity> {
    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      where: { id, workspaceId },
    });

    if (!isDefined(fieldMetadata)) {
      throw new NotFoundError(
        `Unable to find FieldMetadataEntity with id: ${id}`,
      );
    }

    return fieldMetadata;
  }

  @ResolveField(() => ObjectMetadataDTO, { nullable: true })
  async object(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent()
    { objectMetadataId }: Pick<FieldMetadataDTO, 'objectMetadataId'>,
    @Context() context: { loaders: IDataloaders },
  ): Promise<ObjectMetadataDTO | null> {
    return context.loaders.objectMetadataLoader.load({
      workspaceId: workspace.id,
      objectMetadataId,
    });
  }

  @ResolveField(() => Boolean, {
    nullable: true,
    deprecationReason: 'Use isUIEditable',
  })
  async isUIReadOnly(
    @Parent() fieldMetadata: Pick<FieldMetadataDTO, 'isUIEditable'>,
  ): Promise<boolean> {
    return !(fieldMetadata.isUIEditable ?? true);
  }

  private async resolveStandardOverride(
    fieldMetadata: FieldMetadataStandardOverrideParent,
    labelKey: 'label' | 'description' | 'icon',
    context: { loaders: IDataloaders } & I18nContext,
    workspaceId: string,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    const standardApplicationId =
      await context.loaders.standardApplicationIdLoader.load({ workspaceId });

    const isStandardApp = fieldMetadata.applicationId === standardApplicationId;

    const applicationCatalog =
      await context.loaders.applicationTranslationCatalogLoader.load({
        applicationId: fieldMetadata.applicationId,
        workspaceId,
        locale: context.req.locale,
      });

    return resolveEffectiveEntityProperty({
      metadataName: 'fieldMetadata',
      baseValue: fieldMetadata[labelKey],
      overrides: fieldMetadata.overrides,
      property: labelKey,
      i18nContext: {
        locale: context.req.locale,
        i18nInstance: i18n,
        isStandardApp,
        applicationCatalog,
      },
    });
  }

  @ResolveField(() => String, { nullable: true })
  async label(
    @Parent() fieldMetadata: FieldMetadataStandardOverrideParent,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      fieldMetadata,
      'label',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() fieldMetadata: FieldMetadataStandardOverrideParent,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      fieldMetadata,
      'description',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() fieldMetadata: FieldMetadataStandardOverrideParent,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      fieldMetadata,
      'icon',
      context,
      workspaceId,
    );
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async createOneField(
    @Args('input') input: CreateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const flatFieldMetadata = await this.fieldMetadataService.createOneField({
        createFieldInput: input.field,
        workspaceId,
      });

      return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const flatFieldMetadata = await this.fieldMetadataService.updateOneField({
        updateFieldInput: { ...input.update, id: input.id },
        workspaceId,
      });

      return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async deleteOneField(
    @Args('input') deleteOneFieldInput: DeleteOneFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    if (!isDefined(workspaceId)) {
      throw new ForbiddenError('Could not retrieve workspace ID');
    }

    try {
      const flatFieldMetadata = await this.fieldMetadataService.deleteOneField({
        deleteOneFieldInput,
        workspaceId,
      });

      return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RelationDTO, { nullable: true })
  async relation(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent()
    {
      id: fieldMetadataId,
      objectMetadataId,
    }: Pick<FieldMetadataDTO, 'id' | 'objectMetadataId'>,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RelationDTO | null> {
    try {
      return await context.loaders.relationLoader.load({
        fieldMetadataId,
        objectMetadataId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => [RelationDTO], { nullable: true })
  async morphRelations(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent()
    {
      id: fieldMetadataId,
      objectMetadataId,
    }: Pick<FieldMetadataDTO, 'id' | 'objectMetadataId'>,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RelationDTO[] | null> {
    try {
      return await context.loaders.morphRelationLoader.load({
        fieldMetadataId,
        objectMetadataId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
