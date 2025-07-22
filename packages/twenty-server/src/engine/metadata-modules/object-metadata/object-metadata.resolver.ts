import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  UpdateObjectPayload,
  UpdateOneObjectInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
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
    private readonly beforeUpdateOneObject: BeforeUpdateOneObject<UpdateObjectPayload>,
  ) {}

  @ResolveField(() => String, { nullable: true })
  async labelPlural(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'labelPlural',
      context.req.locale,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async labelSingular(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'labelSingular',
      context.req.locale,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'description',
      context.req.locale,
    );
  }

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @ResolveField(() => String, { nullable: true })
  async icon(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return resolveObjectMetadataStandardOverride(
      objectMetadata,
      'icon',
      context.req.locale,
    );
  }

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async deleteOneObject(
    @Args('input') input: DeleteOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.objectMetadataService.deleteOneObject(
        input,
        workspaceId,
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') input: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Context() context: I18nContext,
  ) {
    try {
      const updatedInput = (await this.beforeUpdateOneObject.run(input, {
        workspaceId,
        locale: context.req.locale,
      })) as UpdateOneObjectInput;

      return await this.objectMetadataService.updateOneObject(
        updatedInput,
        workspaceId,
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => [FieldMetadataDTO], { nullable: false })
  async fieldsList(
    @AuthWorkspace() workspace: Workspace,
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
    @AuthWorkspace() workspace: Workspace,
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
}
