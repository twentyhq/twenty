import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared/types';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
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
import { BeforeUpdateOneField } from 'src/engine/metadata-modules/field-metadata/hooks/before-update-one-field.hook';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

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
  ) {}

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
