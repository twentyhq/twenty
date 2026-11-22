/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type RecordSharingDelegate } from 'src/engine/permissions/record-share/types/record-sharing-delegate.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingDelegateRegistryService {
  private readonly delegateByObjectUniversalIdentifier = new Map<
    string,
    RecordSharingDelegate
  >();

  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  register(delegate: RecordSharingDelegate): void {
    this.delegateByObjectUniversalIdentifier.set(
      delegate.objectUniversalIdentifier,
      delegate,
    );
  }

  async findEnabledDelegate({
    workspaceId,
    objectMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
  }): Promise<RecordSharingDelegate | undefined> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const delegate = isDefined(flatObjectMetadata)
      ? this.delegateByObjectUniversalIdentifier.get(
          flatObjectMetadata.universalIdentifier,
        )
      : undefined;

    return isDefined(delegate) && (await delegate.isEnabled(workspaceId))
      ? delegate
      : undefined;
  }
}
