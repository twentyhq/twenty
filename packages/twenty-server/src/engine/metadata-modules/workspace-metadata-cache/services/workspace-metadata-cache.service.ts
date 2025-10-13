import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

type GetExistingOrRecomputeMetadataMapsResult = {
  objectMetadataMaps: ObjectMetadataMaps;
  metadataVersion: number;
};

@Injectable()
export class WorkspaceMetadataCacheService {
  logger = new Logger(WorkspaceMetadataCacheService.name);

  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {}

  async getExistingOrRecomputeMetadataMaps({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<GetExistingOrRecomputeMetadataMapsResult> {
    const currentCacheVersion =
      await this.getMetadataVersionFromCache(workspaceId);

    const currentDatabaseVersion =
      await this.getMetadataVersionFromDatabase(workspaceId);

    if (!isDefined(currentDatabaseVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found in the database',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const shouldRecompute =
      !isDefined(currentCacheVersion) ||
      currentCacheVersion !== currentDatabaseVersion;

    const existingObjectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        currentDatabaseVersion,
      );

    if (isDefined(existingObjectMetadataMaps) && !shouldRecompute) {
      return {
        objectMetadataMaps: existingObjectMetadataMaps,
        metadataVersion: currentDatabaseVersion,
      };
    }

    const { objectMetadataMaps, metadataVersion } =
      await this.recomputeMetadataCache({
        workspaceId,
      });

    return {
      objectMetadataMaps,
      metadataVersion,
    };
  }

  async recomputeMetadataCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<GetExistingOrRecomputeMetadataMapsResult> {
    const currentDatabaseVersion =
      await this.getMetadataVersionFromDatabase(workspaceId);

    if (!isDefined(currentDatabaseVersion)) {
      throw new WorkspaceMetadataVersionException(
        'Metadata version not found in the database',
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    await this.workspaceCacheStorageService.flushVersionedMetadata(workspaceId);

    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
    });

    // Inject non-persisted redis-backed field(s) into metadata so they appear in listings
    const companyObject = objectMetadataItems.find(
      (obj) => obj.standardId === STANDARD_OBJECT_IDS.company,
    );

    if (companyObject) {
      const hasLastViewedAt = companyObject.fields?.some(
        (f) =>
          f.standardId === COMPANY_STANDARD_FIELD_IDS.lastViewedAt ||
          f.name === 'lastViewedAt',
      );

      if (!hasLastViewedAt) {
        const synthetic = new FieldMetadataEntity();

        synthetic.id = COMPANY_STANDARD_FIELD_IDS.lastViewedAt; // in-memory identifier
        synthetic.standardId = COMPANY_STANDARD_FIELD_IDS.lastViewedAt;
        synthetic.objectMetadataId = companyObject.id;
        synthetic.object = companyObject;
        synthetic.type =
          FieldMetadataType.DATE_TIME as unknown as typeof synthetic.type;
        synthetic.name = 'lastViewedAt';
        synthetic.label = 'Last view date';
        synthetic.description = 'Last view date';
        synthetic.icon = 'IconCalendar';
        synthetic.defaultValue = null;
        synthetic.options = null;
        synthetic.settings = null;
        synthetic.isCustom = false;
        synthetic.isActive = true;
        synthetic.isSystem = false;
        synthetic.isUIReadOnly = true;
        synthetic.isNullable = true;
        synthetic.isUnique = false;
        synthetic.workspaceId = workspaceId;
        synthetic.isLabelSyncedWithName = true;
        synthetic.relationTargetFieldMetadata = null as unknown as never;
        synthetic.relationTargetFieldMetadataId = null as unknown as never;
        synthetic.relationTargetObjectMetadata = null as unknown as never;
        synthetic.relationTargetObjectMetadataId = null as unknown as never;
        synthetic.morphId = null as unknown as never;

        companyObject.fields = [...(companyObject.fields ?? []), synthetic];
      }
    }

    const objectMetadataItemsIds = objectMetadataItems.map(
      (objectMetadataItem) => objectMetadataItem.id,
    );

    const indexMetadataItems = await this.indexMetadataRepository.find({
      where: { objectMetadataId: In(objectMetadataItemsIds) },
      relations: ['indexFieldMetadatas'],
    });

    const objectMetadataItemsWithIndexMetadatas = objectMetadataItems.map(
      (objectMetadataItem) => ({
        ...objectMetadataItem,
        indexMetadatas: indexMetadataItems.filter(
          (indexMetadataItem) =>
            indexMetadataItem.objectMetadataId === objectMetadataItem.id,
        ),
      }),
    );

    const freshObjectMetadataMaps = generateObjectMetadataMaps(
      objectMetadataItemsWithIndexMetadatas,
    );

    await this.workspaceCacheStorageService.setObjectMetadataMaps(
      workspaceId,
      currentDatabaseVersion,
      freshObjectMetadataMaps,
    );

    await this.workspaceCacheStorageService.setMetadataVersion(
      workspaceId,
      currentDatabaseVersion,
    );

    return {
      objectMetadataMaps: freshObjectMetadataMaps,
      metadataVersion: currentDatabaseVersion,
    };
  }

  private async getMetadataVersionFromDatabase(
    workspaceId: string,
  ): Promise<number | undefined> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    return workspace?.metadataVersion;
  }

  private async getMetadataVersionFromCache(
    workspaceId: string,
  ): Promise<number | undefined> {
    return await this.workspaceCacheStorageService.getMetadataVersion(
      workspaceId,
    );
  }
}
