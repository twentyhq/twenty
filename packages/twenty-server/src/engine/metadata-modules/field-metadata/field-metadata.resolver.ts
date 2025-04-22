import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  ForbiddenError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  RelationDefinitionDTO,
  RelationDefinitionType,
} from 'src/engine/metadata-modules/field-metadata/dtos/relation-definition.dto';
import { RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import {
  UpdateFieldInput,
  UpdateOneFieldMetadataInput,
} from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { BeforeUpdateOneField } from 'src/engine/metadata-modules/field-metadata/hooks/before-update-one-field.hook';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FieldMetadataDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class FieldMetadataResolver {
  constructor(
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly beforeUpdateOneField: BeforeUpdateOneField<UpdateFieldInput>,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async label(
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.fieldMetadataService.resolveOverridableString(
      fieldMetadata,
      'label',
      context.req.headers['x-locale'],
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.fieldMetadataService.resolveOverridableString(
      fieldMetadata,
      'description',
      context.req.headers['x-locale'],
    );
  }

  @UseGuards(SettingsPermissionsGuard(SettingPermissionType.DATA_MODEL))
  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.fieldMetadataService.resolveOverridableString(
      fieldMetadata,
      'icon',
      context.req.headers['x-locale'],
    );
  }

  @UseGuards(SettingsPermissionsGuard(SettingPermissionType.DATA_MODEL))
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
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(SettingPermissionType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Context() context: I18nContext,
  ) {
    try {
      const updatedInput = (await this.beforeUpdateOneField.run(input, {
        workspaceId,
        locale: context.req.headers['x-locale'],
      })) as UpdateOneFieldMetadataInput;

      return await this.fieldMetadataService.updateOne(updatedInput.id, {
        ...updatedInput.update,
        workspaceId,
      });
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(SettingPermissionType.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async deleteOneField(
    @Args('input') input: DeleteOneFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    if (!workspaceId) {
      throw new ForbiddenError('Could not retrieve workspace ID');
    }

    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: input.id.toString(),
        },
      });

    if (!fieldMetadata) {
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

  @ResolveField(() => RelationDefinitionDTO, { nullable: true })
  async relationDefinition(
    @AuthWorkspace() workspace: Workspace,
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RelationDefinitionDTO | null | undefined> {
    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return null;
    }

    const isNewRelationEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IsNewRelationEnabled,
      workspace.id,
    );

    // TODO: Remove this once we drop old relations or update the front-end to use the new relation
    if (isNewRelationEnabled) {
      const relation = await this.relation(
        workspace,
        fieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>,
        context,
      );

      if (!relation) {
        return null;
      }

      return {
        // Temporary fix as we don't have relationId in the new relation
        relationId: createDeterministicUuid([
          relation.sourceFieldMetadata.id,
          relation.targetFieldMetadata.id,
        ]),
        direction: relation.type as unknown as RelationDefinitionType,
        sourceObjectMetadata: relation.sourceObjectMetadata,
        targetObjectMetadata: relation.targetObjectMetadata,
        sourceFieldMetadata: relation.sourceFieldMetadata,
        targetFieldMetadata: relation.targetFieldMetadata,
      };
    }

    try {
      const relationMetadataItem =
        await context.loaders.relationMetadataLoader.load({
          fieldMetadata,
          workspaceId: workspace.id,
        });

      return await this.fieldMetadataService.getRelationDefinitionFromRelationMetadata(
        fieldMetadata,
        relationMetadataItem,
      );
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RelationDTO, { nullable: true })
  async relation(
    @AuthWorkspace() workspace: Workspace,
    @Parent() fieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RelationDTO | null | undefined> {
    if (!isRelationFieldMetadataType(fieldMetadata.type)) {
      return null;
    }

    try {
      const isNewRelationEnabled =
        await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IsNewRelationEnabled,
          workspace.id,
        );

      if (!isNewRelationEnabled) {
        throw new FieldMetadataException(
          'New relation feature is not enabled for this workspace',
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_NOT_ENABLED,
        );
      }
      const {
        sourceObjectMetadata,
        targetObjectMetadata,
        sourceFieldMetadata,
        targetFieldMetadata,
      } = await context.loaders.relationLoader.load({
        fieldMetadata,
        workspaceId: workspace.id,
      });

      if (!fieldMetadata.settings) {
        throw new FieldMetadataException(
          'Relation settings are required',
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        );
      }

      return {
        type: fieldMetadata.settings.relationType,
        sourceObjectMetadata,
        targetObjectMetadata,
        sourceFieldMetadata,
        targetFieldMetadata,
      };
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
