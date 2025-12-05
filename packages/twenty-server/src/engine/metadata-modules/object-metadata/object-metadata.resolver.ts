import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { fromFlatObjectMetadataToObjectMetadataDto } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-object-metadata-dto.util';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { CreateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => ObjectMetadataDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class ObjectMetadataResolver {
  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly i18nService: I18nService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async labelPlural(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'labelPlural',
      context.req.locale,
      i18n,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async labelSingular(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'labelSingular',
      context.req.locale,
      i18n,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'description',
      context.req.locale,
      i18n,
    );
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    const i18n = this.i18nService.getI18nInstance(context.req.locale);

    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'icon',
      context.req.locale,
      i18n,
    );
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async createOneObject(
    @Args('input') input: CreateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.createOneObject({
          createObjectInput: input.object,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async deleteOneObject(
    @Args('input') deleteObjectInput: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.deleteOneObject({
          deleteObjectInput,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') updateObjectInput: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
  ) {
    try {
      const flatobjectMetadata =
        await this.objectMetadataService.updateOneObject({
          updateObjectInput,
          workspaceId,
        });

      return fromFlatObjectMetadataToObjectMetadataDto(flatobjectMetadata);
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
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
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );

      return [];
    }
  }

  @ResolveField(() => [IndexMetadataDTO], { nullable: false })
  async indexMetadataList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
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
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );

      return [];
    }
  }
}
