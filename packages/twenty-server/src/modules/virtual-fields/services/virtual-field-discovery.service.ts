import { Injectable } from '@nestjs/common';

import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { VirtualField } from 'src/modules/virtual-fields/types/VirtualField';

type VirtualFieldMetadata = {
  fieldName: string;
  virtualField: VirtualField;
  objectMetadataId: string;
};

@Injectable()
export class VirtualFieldDiscoveryService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async hasVirtualFields(
    objectMetadataId: string,
    workspaceId?: string,
  ): Promise<boolean> {
    const entityTarget =
      this.findEntityTargetByObjectMetadataId(objectMetadataId);

    if (entityTarget) {
      const fieldMetadataArray = metadataArgsStorage.filterFields(entityTarget);

      if (fieldMetadataArray.some((field) => field.virtualField)) {
        return true;
      }
    }

    if (workspaceId) {
      return await this.hasCustomVirtualFields(objectMetadataId, workspaceId);
    }

    return false;
  }

  async hasCustomVirtualFields(
    objectMetadataId: string,
    workspaceId: string,
  ): Promise<boolean> {
    try {
      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
          workspaceId,
        );

      const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

      if (!objectMetadata) {
        return false;
      }

      return Object.values(objectMetadata.fieldsById).some(
        (field) =>
          field.virtualField !== null && field.virtualField !== undefined,
      );
    } catch {
      return false;
    }
  }

  async getVirtualFieldsForObjectMetadata(
    objectMetadataId: string,
    workspaceId?: string,
  ): Promise<VirtualFieldMetadata[]> {
    const decoratorFields =
      this.getDecoratorBasedVirtualFields(objectMetadataId);

    if (!workspaceId) {
      return decoratorFields;
    }

    const customFields = await this.getCustomVirtualFields(
      objectMetadataId,
      workspaceId,
    );

    return [...decoratorFields, ...customFields];
  }

  async getAllVirtualFields(
    workspaceId: string,
  ): Promise<VirtualFieldMetadata[]> {
    const allVirtualFields: VirtualFieldMetadata[] = [];

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

    for (const objectMetadata of Object.values(objectMetadataMaps.byId)) {
      if (!objectMetadata) {
        continue;
      }

      const virtualFieldsForObject =
        await this.getVirtualFieldsForObjectMetadata(
          objectMetadata.id,
          workspaceId,
        );

      allVirtualFields.push(...virtualFieldsForObject);
    }

    return allVirtualFields;
  }

  getEntityNameFromTarget(objectMetadataId: string): string {
    for (const [key, value] of Object.entries(STANDARD_OBJECT_IDS)) {
      if (value === objectMetadataId) {
        return key;
      }
    }

    return 'unknown';
  }

  private getDecoratorBasedVirtualFields(
    objectMetadataId: string,
  ): VirtualFieldMetadata[] {
    const entityTarget =
      this.findEntityTargetByObjectMetadataId(objectMetadataId);

    if (!entityTarget) {
      return [];
    }

    const fieldMetadataArray = metadataArgsStorage.filterFields(entityTarget);

    return fieldMetadataArray
      .filter((field) => field.virtualField)
      .map((field) => ({
        fieldName: field.name,
        virtualField: field.virtualField!,
        objectMetadataId: field.virtualField!.objectMetadataId,
      }));
  }

  private async getCustomVirtualFields(
    objectMetadataId: string,
    workspaceId: string,
  ): Promise<VirtualFieldMetadata[]> {
    try {
      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
          workspaceId,
        );

      const objectMetadata = objectMetadataMaps.byId[objectMetadataId];

      if (!objectMetadata) {
        return [];
      }

      return Object.values(objectMetadata.fieldsById)
        .filter(
          (field) =>
            field.virtualField !== null && field.virtualField !== undefined,
        )
        .map((field) => ({
          fieldName: field.name,
          virtualField: field.virtualField!,
          objectMetadataId: field.virtualField!.objectMetadataId,
        }));
    } catch {
      return [];
    }
  }

  private findEntityTargetByObjectMetadataId(
    objectMetadataId: string,
  ): Function | null {
    for (const entityTarget of standardObjectMetadataDefinitions) {
      const fieldMetadataArray = metadataArgsStorage.filterFields(entityTarget);

      for (const fieldMetadata of fieldMetadataArray) {
        if (fieldMetadata.virtualField?.objectMetadataId === objectMetadataId) {
          return entityTarget;
        }
      }
    }

    return null;
  }
}
