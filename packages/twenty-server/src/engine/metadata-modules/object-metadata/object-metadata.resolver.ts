import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  UpdateObjectPayload,
  UpdateOneObjectInput,
} from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => ObjectMetadataDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
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
    return this.objectMetadataService.resolveTranslatableString(
      objectMetadata,
      'labelPlural',
      context.req.headers['x-locale'],
    );
  }

  @ResolveField(() => String, { nullable: true })
  async labelSingular(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.objectMetadataService.resolveTranslatableString(
      objectMetadata,
      'labelSingular',
      context.req.headers['x-locale'],
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() objectMetadata: ObjectMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.objectMetadataService.resolveTranslatableString(
      objectMetadata,
      'description',
      context.req.headers['x-locale'],
    );
  }

  @UseGuards(SettingsPermissionsGuard(SettingsFeatures.DATA_MODEL))
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

  @UseGuards(SettingsPermissionsGuard(SettingsFeatures.DATA_MODEL))
  @Mutation(() => ObjectMetadataDTO)
  async updateOneObject(
    @Args('input') input: UpdateOneObjectInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      await this.beforeUpdateOneObject.run(input, workspaceId);

      return await this.objectMetadataService.updateOneObject(
        input,
        workspaceId,
      );
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
