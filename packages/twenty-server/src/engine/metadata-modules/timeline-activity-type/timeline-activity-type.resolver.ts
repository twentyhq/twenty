import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
} from '@nestjs/graphql';

import { isNonEmptyString } from '@sniptt/guards';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PermissionFlagType } from 'twenty-shared/constants';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { UpdateTimelineActivityTypeInput } from 'src/engine/metadata-modules/timeline-activity-type/dtos/update-timeline-activity-type.input';
import { TimelineActivityTypeGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/timeline-activity-type/interceptors/timeline-activity-type-graphql-api-exception.interceptor';
import { TimelineActivityTypeService } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.service';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard)
@UseInterceptors(
  WorkspaceMigrationGraphqlApiExceptionInterceptor,
  TimelineActivityTypeGraphqlApiExceptionInterceptor,
)
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
      overrides: timelineActivityType.overrides,
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

  @Mutation(() => TimelineActivityTypeDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async updateTimelineActivityType(
    @Args('input') input: UpdateTimelineActivityTypeInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityTypeDTO> {
    return this.timelineActivityTypeService.update({
      input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TimelineActivityTypeDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async resetTimelineActivityType(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TimelineActivityTypeDTO> {
    return this.timelineActivityTypeService.reset({
      id,
      workspaceId: workspace.id,
    });
  }
}
