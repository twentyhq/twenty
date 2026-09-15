import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation, Parent, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { fromFlatIndexMetadataToIndexMetadataDto } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-flat-index-metadata-to-index-metadata-dto.util';
import { CreateOneIndexInput } from 'src/engine/metadata-modules/index-metadata/dtos/create-one-index.input';
import { DeleteOneIndexInput } from 'src/engine/metadata-modules/index-metadata/dtos/delete-index.input';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/services/index-metadata.service';
import { indexMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/index-metadata/utils/index-metadata-graphql-api-exception-handler.util';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => IndexMetadataDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class IndexMetadataResolver {
  constructor(private readonly indexMetadataService: IndexMetadataService) {}

  @ResolveField(() => [IndexFieldMetadataDTO], { nullable: false })
  async indexFieldMetadataList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() indexMetadata: IndexMetadataDTO,
    @Context() context: { loaders: IDataloaders },
  ): Promise<IndexFieldMetadataDTO[]> {
    try {
      const indexFieldMetadataItems =
        await context.loaders.indexFieldMetadataLoader.load({
          objectMetadata: { id: indexMetadata.objectMetadataId },
          indexMetadata,
          workspaceId: workspace.id,
        });

      return indexFieldMetadataItems;
    } catch (error) {
      objectMetadataGraphqlApiExceptionHandler(error);

      return [];
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => IndexMetadataDTO)
  async createOneIndex(
    @Args('input') input: CreateOneIndexInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<IndexMetadataDTO> {
    try {
      const flatIndexMetadata = await this.indexMetadataService.createOne({
        createIndexInput: input.index,
        workspaceId,
      });

      return fromFlatIndexMetadataToIndexMetadataDto(flatIndexMetadata);
    } catch (error) {
      return indexMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Mutation(() => IndexMetadataDTO)
  async deleteOneIndex(
    @Args('input') input: DeleteOneIndexInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<IndexMetadataDTO> {
    try {
      const flatIndexMetadata = await this.indexMetadataService.deleteOne({
        id: input.id,
        workspaceId,
      });

      return fromFlatIndexMetadataToIndexMetadataDto(flatIndexMetadata);
    } catch (error) {
      return indexMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
