import { UseGuards } from '@nestjs/common';
import { Context, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { TimelineActivityTypeService } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.service';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => TimelineActivityTypeDTO)
export class TimelineActivityTypeResolver {
  constructor(
    private readonly timelineActivityTypeService: TimelineActivityTypeService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  @ResolveField(() => String)
  async label(
    @Parent() timelineActivityType: TimelineActivityTypeDTO,
    @Context() context: { loaders: IDataloaders } & I18nContext,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    if (!isNonEmptyString(timelineActivityType.label)) {
      return timelineActivityType.label;
    }

    return resolveEffectiveEntityProperty({
      metadataName: 'timelineActivityType',
      baseValue: timelineActivityType.label,
      // A timeline activity type carries no overrides: a workspace that wants
      // different wording edits the row, leaving nothing to arbitrate against.
      overrides: undefined,
      property: 'label',
      i18nContext:
        await this.applicationTranslationCatalogService.buildEffectiveEntityI18nContext(
          {
            applicationId: timelineActivityType.applicationId,
            loaders: context.loaders,
            locale: context.req.locale,
            workspaceId: workspace.id,
          },
        ),
    });
  }

  @Query(() => [TimelineActivityTypeDTO])
  @UseGuards(NoPermissionGuard)
  async timelineActivityTypes(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityTypeDTO[]> {
    return await this.timelineActivityTypeService.findAll({
      workspaceId: workspace.id,
    });
  }
}
