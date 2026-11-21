import { UsePipes, UseGuards } from '@nestjs/common';
import { Context, Parent, ResolveField } from '@nestjs/graphql';

import { isWorkspaceCustomIndex } from 'twenty-shared/metadata';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { IS_CUSTOM_DEPRECATION_REASON } from 'src/engine/metadata-modules/utils/constants/is-custom-deprecation-reason.constant';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@MetadataResolver(() => IndexMetadataDTO)
@UsePipes(ResolverValidationPipe)
export class IndexMetadataFieldsResolver {
  @ResolveField(() => Boolean, {
    nullable: true,
    deprecationReason: IS_CUSTOM_DEPRECATION_REASON,
  })
  @UseGuards(NoPermissionGuard)
  isCustom(
    @Parent() indexMetadata: IndexMetadataDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): boolean {
    return isWorkspaceCustomIndex({
      indexMetadata,
      workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
    });
  }

  @ResolveField(() => [IndexFieldMetadataDTO], { nullable: false })
  @UseGuards(NoPermissionGuard)
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
}
