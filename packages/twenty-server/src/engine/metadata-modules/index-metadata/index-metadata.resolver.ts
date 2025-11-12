import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => IndexMetadataDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class IndexMetadataResolver {
  constructor(private readonly i18nService: I18nService) {}

  @ResolveField(() => [IndexFieldMetadataDTO], { nullable: false })
  async indexFieldMetadataList(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Parent() indexMetadata: IndexMetadataDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
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
      objectMetadataGraphqlApiExceptionHandler(
        error,
        this.i18nService.getI18nInstance(context.req.locale),
      );

      return [];
    }
  }
}
