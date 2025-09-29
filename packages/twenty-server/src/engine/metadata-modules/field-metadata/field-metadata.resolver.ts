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

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  ForbiddenError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import {
  UpdateOneFieldMetadataInput,
  type UpdateFieldInput,
} from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { BeforeUpdateOneField } from 'src/engine/metadata-modules/field-metadata/hooks/before-update-one-field.hook';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { FieldMetadataServiceV2 } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service-v2';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
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
    private readonly beforeUpdateOneField: BeforeUpdateOneField<UpdateFieldInput>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fieldMetadataServiceV2: FieldMetadataServiceV2,
  ) {}

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async createOneField(
    @Args('input') input: CreateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.fieldMetadataService.createOne({
        ...input.field,
        workspaceId,
      });
    } catch (error) {
      return fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Context() context: I18nContext,
  ) {
    const isWorkspaceMigrationV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        workspaceId,
      );

    try {
      if (isWorkspaceMigrationV2Enabled) {
        return await this.fieldMetadataServiceV2.updateOne({
          updateFieldInput: { ...input.update, id: input.id },
          workspaceId,
        });
      }

      const updatedInput = (await this.beforeUpdateOneField.run(input, {
        workspaceId,
        locale: context.req.locale,
      })) as UpdateOneFieldMetadataInput;

      return await this.fieldMetadataService.updateOne(updatedInput.id, {
        ...updatedInput.update,
        workspaceId,
      });
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async deleteOneField(
    @Args('input') input: DeleteOneFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    if (!isDefined(workspaceId)) {
      throw new ForbiddenError('Could not retrieve workspace ID');
    }

    try {
      const isWorkspaceMigrationV2Enabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
          workspaceId,
        );

      if (isWorkspaceMigrationV2Enabled) {
        return await this.fieldMetadataServiceV2.deleteOneField({
          deleteOneFieldInput: input,
          workspaceId,
        });
      }
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }

    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: input.id.toString(),
        },
      });

    if (!isDefined(fieldMetadata)) {
      throw new ValidationError('Field does not exist');
    }

    if (!fieldMetadata.isCustom) {
      throw new ValidationError("Standard Fields can't be deleted");
    }

    if (fieldMetadata.isActive) {
      throw new ValidationError("Active fields can't be deleted");
    }

    try {
      return await this.fieldMetadataService.deleteOneField(input, workspaceId);
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RelationDTO, { nullable: true })
  async relation(
    @AuthWorkspace() workspace: Workspace,

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
    @AuthWorkspace() workspace: Workspace,
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
