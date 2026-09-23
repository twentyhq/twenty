import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Context, Parent, ResolveField } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { SettingsMenuItemDTO } from 'src/engine/metadata-modules/settings-menu-item/dtos/settings-menu-item.dto';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
@MetadataResolver(() => SettingsMenuItemDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class SettingsMenuItemResolver {
  constructor(
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async title(
    @Parent() settingsMenuItem: SettingsMenuItemDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    if (!isNonEmptyString(settingsMenuItem.title)) {
      return settingsMenuItem.title;
    }

    return resolveEffectiveEntityProperty({
      metadataName: 'settingsMenuItem',
      baseValue: settingsMenuItem.title,
      // settingsMenuItem carries no overrides column: only the application that
      // declared the item can rename it, so there is no workspace-authored value
      // to arbitrate against the standard one.
      overrides: undefined,
      property: 'title',
      i18nContext:
        await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
          {
            applicationId: settingsMenuItem.applicationId,
            loaders: context.loaders,
            locale: context.req.locale,
            workspaceId: workspace.id,
          },
        ),
    });
  }
}
