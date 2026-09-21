import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MetadataTranslationDTO } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translation.dto';
import { MetadataTranslationsInput } from 'src/engine/metadata-modules/metadata-translation/dtos/metadata-translations.input';
import { MetadataTranslationService } from 'src/engine/metadata-modules/metadata-translation/services/metadata-translation.service';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => MetadataTranslationDTO)
export class MetadataTranslationResolver {
  constructor(
    private readonly metadataTranslationService: MetadataTranslationService,
  ) {}

  @UseGuards(SettingsPermissionGuard(PermissionFlagType.DATA_MODEL))
  @Query(() => [MetadataTranslationDTO])
  async metadataTranslations(
    @Args('input') input: MetadataTranslationsInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<MetadataTranslationDTO[]> {
    return this.metadataTranslationService.findMetadataTranslations({
      input,
      workspaceId,
    });
  }
}
