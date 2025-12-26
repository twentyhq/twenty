import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from 'twenty-shared/constants';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { UpdateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';
import { fromFlatFieldMetadataToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-flat-field-metadata-to-field-metadata-dto.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@UsePipes(ResolverValidationPipe)
@Resolver(() => FieldMetadataDTO)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class FieldMetadataResolver {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly i18nService: I18nService,
  ) {}

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async createOneField(
    @Args('input') input: CreateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
  ) {
    try {
      const flatFieldMetadata = await this.fieldMetadataService.createOneField({
        createFieldInput: input.field,
        workspaceId,
      });

      return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
  ) {
    try {
      const flatFieldMetadata = await this.fieldMetadataService.updateOneField({
        updateFieldInput: { ...input.update, id: input.id },
        workspaceId,
      });

      return fromFlatFieldMetadataToFieldMetadataDto(flatFieldMetadata);
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async deleteOneField(
    @Args('input') deleteOneFieldInput: DeleteOneFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Context() context: I18nContext,
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
      fieldMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
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
    @Context() context: { loaders: IDataloaders } & I18nContext,
  ): Promise<RelationDTO | null> {
    try {
      return await context.loaders.relationLoader.load({
        fieldMetadataId,
        objectMetadataId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
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
    @Context() context: { loaders: IDataloaders } & I18nContext,
  ): Promise<RelationDTO[] | null> {
    try {
      return await context.loaders.morphRelationLoader.load({
        fieldMetadataId,
        objectMetadataId,
        workspaceId: workspace.id,
      });
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );
    }
  }
}
