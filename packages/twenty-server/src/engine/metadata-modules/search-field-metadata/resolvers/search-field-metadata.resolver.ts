import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { AddSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/add-search-field.input';
import { RemoveSearchFieldInput } from 'src/engine/metadata-modules/search-field-metadata/dtos/inputs/remove-search-field.input';
import { SearchFieldMetadataDTO } from 'src/engine/metadata-modules/search-field-metadata/dtos/search-field-metadata.dto';
import { SearchFieldMetadataService } from 'src/engine/metadata-modules/search-field-metadata/services/search-field-metadata.service';

@Resolver(() => SearchFieldMetadataDTO)
@UseFilters(
  PermissionsGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UseGuards(WorkspaceAuthGuard)
export class SearchFieldMetadataResolver {
  constructor(
    private readonly searchFieldMetadataService: SearchFieldMetadataService,
  ) {}

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => SearchFieldMetadataDTO)
  async addSearchField(
    @Args('input') addSearchFieldInput: AddSearchFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SearchFieldMetadataDTO> {
    return await this.searchFieldMetadataService.addSearchField({
      addSearchFieldInput,
      workspaceId,
    });
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => SearchFieldMetadataDTO)
  async removeSearchField(
    @Args('input') removeSearchFieldInput: RemoveSearchFieldInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<SearchFieldMetadataDTO> {
    return await this.searchFieldMetadataService.removeSearchField({
      removeSearchFieldInput,
      workspaceId,
    });
  }
}
