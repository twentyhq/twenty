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
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  FIELD_FILTER_COLUMN_BY_FILTER_FIELD,
  FieldFilterInput,
} from 'src/engine/metadata-modules/field-metadata/dtos/field-filter.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import {
  INDEX_FILTER_COLUMN_BY_FILTER_FIELD,
  IndexFilterInput,
} from 'src/engine/metadata-modules/index-metadata/dtos/index-filter.input';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { CreateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  ObjectConnectionDTO,
  ObjectFieldsConnectionDTO,
  ObjectIndexMetadatasConnectionDTO,
} from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata-connection.dto';
import {
  OBJECT_FILTER_COLUMN_BY_FILTER_FIELD,
  ObjectFilterInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/object-filter.input';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectRecordCountDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-record-count.dto';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { applyMetadataFilterToQueryBuilder } from 'src/engine/metadata-modules/pagination/utils/apply-metadata-filter-to-query-builder.util';
import { findManyWithCursorPagination } from 'src/engine/metadata-modules/pagination/utils/find-many-with-cursor-pagination.util';
import { getEffectiveImageIdentifierFieldMetadataId } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-image-identifier-field-metadata-id.util';
import { MostlyEmptyFieldsService } from 'src/engine/metadata-modules/object-metadata/mostly-empty-fields.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { ObjectRecordCountService } from 'src/engine/metadata-modules/object-metadata/object-record-count.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ObjectMetadataDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class ObjectMetadataResolver {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly objectRecordCountService: ObjectRecordCountService,
    private readonly mostlyEmptyFieldsService: MostlyEmptyFieldsService,
    private readonly i18nService: I18nService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: WorkspaceScopedRepository<IndexMetadataEntity>,
  ) {}

  @UseGuards(NoPermissionGuard)
  @Query(() => ObjectConnectionDTO)
  async objects(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('paging', {
      type: () => CursorPagingInput,
      defaultValue: { first: 10 },
      description: 'Limit or page results.',
    })
    paging: CursorPagingInput,
    @Args('filter', {
      type: () => ObjectFilterInput,
      defaultValue: {},
      description: 'Specify to filter the records returned.',
    })
    filter: ObjectFilterInput,
  ): Promise<CursorConnection<ObjectMetadataEntity>> {
    const queryBuilder = this.objectMetadataRepository
      .createQueryBuilder('objectMetadata')
      .where('"objectMetadata"."workspaceId" = :workspaceId', { workspaceId });

    applyMetadataFilterToQueryBuilder({
      whereBuilder: queryBuilder,
      alias: 'objectMetadata',
      filter,
      columnByFilterField: OBJECT_FILTER_COLUMN_BY_FILTER_FIELD,
    });

    return findManyWithCursorPagination({
      queryBuilder,
      alias: 'objectMetadata',
      paging,
      defaultResultSize: 10,
      maxResultsSize: 1000,
    });
  }

  @UseGuards(NoPermissionGuard)
  @Query(() => ObjectMetadataDTO)
  async object(
    @Args('id', {
      type: () => UUIDScalarType,
      description: 'The id of the record to find.',
    })
    id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectMetadataEntity> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: { id, workspaceId },
    });

    if (!isDefined(objectMetadata)) {
      throw new NotFoundError(
        `Unable to find ObjectMetadataEntity with id: ${id}`,
      );
    }

    return objectMetadata;
  }

  @ResolveField(() => ObjectFieldsConnectionDTO)
  async fields(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Parent() objectMetadata: Pick<ObjectMetadataDTO, 'id'>,
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
      .where('"fieldMetadata"."workspaceId" = :workspaceId', { workspaceId })
      .andWhere('"fieldMetadata"."objectMetadataId" = :objectMetadataId', {
        objectMetadataId: objectMetadata.id,
      });

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

  @ResolveField(() => ObjectIndexMetadatasConnectionDTO)
  async indexMetadatas(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Parent() objectMetadata: Pick<ObjectMetadataDTO, 'id'>,
    @Args('paging', {
      type: () => CursorPagingInput,
      defaultValue: { first: 10 },
      description: 'Limit or page results.',
    })
    paging: CursorPagingInput,
    @Args('filter', {
      type: () => IndexFilterInput,
      defaultValue: {},
      description: 'Specify to filter the records returned.',
    })
    filter: IndexFilterInput,
  ): Promise<CursorConnection<IndexMetadataEntity>> {
    const queryBuilder = this.indexMetadataRepository
      .createQueryBuilder('indexMetadata')
      .where('"indexMetadata"."workspaceId" = :workspaceId', { workspaceId })
      .andWhere('"indexMetadata"."objectMetadataId" = :objectMetadataId', {
        objectMetadataId: objectMetadata.id,
      });

    applyMetadataFilterToQueryBuilder({
      whereBuilder: queryBuilder,
      alias: 'indexMetadata',
      filter,
      columnByFilterField: INDEX_FILTER_COLUMN_BY_FILTER_FIELD,
    });

    return findManyWithCursorPagination({
      queryBuilder,
      alias: 'indexMetadata',
      paging,
      defaultResultSize: 10,
      maxResultsSize: 1000,
    });
  }

  @ResolveField(() => Boolean, {
    deprecationReason: 'Use isUIEditable',
  })
  async isUIReadOnly(
    @Parent() objectMetadata: ObjectMetadataDTO,
  ): Promise<boolean> {
    return !objectMetadata.isUIEditable;
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Query(() => [ObjectRecordCountDTO])
  async objectRecordCounts(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ObjectRecordCountDTO[]> {
    return this.objectRecordCountService.getRecordCounts(workspaceId);
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Query(() => [UUIDScalarType])
  async mostlyEmptyFieldMetadataIds(
    @Args('objectMetadataId', { type: () => UUIDScalarType })
    objectMetadataId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string[]> {
    try {
      return await this.mostlyEmptyFieldsService.getMostlyEmptyFieldMetadataIds(
        {
          workspaceId,
          objectMetadataId,
        },
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);

      return [];
    }
  }

  private async resolveStandardOverride(
    objectMetadata: ObjectMetadataDTO,
    labelKey:
      | 'color'
      | 'labelPlural'
      | 'labelSingular'
      | 'description'
      | 'icon',
    context: { loaders: IDataloaders } & I18nContext,
    workspaceId: string,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    const standardApplicationId =
      await context.loaders.standardApplicationIdLoader.load({ workspaceId });

    const isStandardApp =
      objectMetadata.applicationId === standardApplicationId;

    const applicationCatalog =
      await context.loaders.applicationTranslationCatalogLoader.load({
        applicationId: objectMetadata.applicationId,
        workspaceId,
        locale: context.req.locale,
      });

    return resolveEffectiveEntityProperty({
      metadataName: 'objectMetadata',
      baseValue: objectMetadata[labelKey],
      overrides: objectMetadata.overrides,
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
  async labelPlural(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      objectMetadata,
      'labelPlural',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async labelSingular(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      objectMetadata,
      'labelSingular',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      objectMetadata,
      'description',
      context,
      workspaceId,
    );
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      objectMetadata,
      'icon',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async color(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<string> {
    return this.resolveStandardOverride(
      objectMetadata,
      'color',
      context,
      workspaceId,
    );
  }

  @ResolveField(() => UUIDScalarType, { nullable: true })
  imageIdentifierFieldMetadataId(
    @Parent() objectMetadata: ObjectMetadataDTO,
  ): string | null {
    return getEffectiveImageIdentifierFieldMetadataId(objectMetadata);
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async createOneObject(
    @Args('input') input: CreateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.createOneObject({
          createObjectInput: input.object,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async deleteOneObject(
    @Args('input') deleteObjectInput: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.deleteOneObject({
          deleteObjectInput,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') updateObjectInput: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.updateOneObject({
          updateObjectInput,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => [FieldMetadataDTO], { nullable: false })
  async fieldsList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
  ): Promise<FieldMetadataDTO[]> {
    try {
      const fieldMetadataItems = await context.loaders.fieldMetadataLoader.load(
        {
          objectMetadata,
          workspaceId: workspace.id,
          locale: context.req.locale,
        },
      );

      return fieldMetadataItems;
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);

      return [];
    }
  }

  @ResolveField(() => [IndexMetadataDTO], { nullable: false })
  async indexMetadataList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders },
  ): Promise<IndexMetadataDTO[]> {
    try {
      const indexMetadataItems = await context.loaders.indexMetadataLoader.load(
        {
          objectMetadata,
          workspaceId: workspace.id,
        },
      );

      return indexMetadataItems;
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);

      return [];
    }
  }

  @ResolveField(() => [SearchFieldMetadataDTO], { nullable: false })
  async searchFieldMetadataList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders },
  ): Promise<SearchFieldMetadataDTO[]> {
    try {
      const searchFieldMetadataItems =
        await context.loaders.searchFieldMetadataLoader.load({
          objectMetadata,
          workspaceId: workspace.id,
        });

      return searchFieldMetadataItems;
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);

      return [];
    }
  }
}
