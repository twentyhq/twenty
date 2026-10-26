import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { toPersonHandleFieldType } from 'src/modules/match-participant/person-handle-field/utils/to-person-handle-field-type.util';

type PersonHandleFieldWithUniversalIdentifier = PersonHandleField & {
  universalIdentifier: string;
};

@Injectable()
export class PersonHandleFieldService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findAll(
    workspaceId: string,
  ): Promise<PersonHandleFieldWithUniversalIdentifier[]> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const personObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
    });

    return getFlatFieldsFromFlatObjectMetadata(
      personObjectMetadata,
      flatFieldMetadataMaps,
    ).flatMap((fieldMetadata) => {
      const type = toPersonHandleFieldType(fieldMetadata.type);

      return fieldMetadata.isActive && isDefined(type)
        ? [
            {
              name: fieldMetadata.name,
              type,
              universalIdentifier: fieldMetadata.universalIdentifier,
            },
          ]
        : [];
    });
  }

  async findByUniversalIdentifier({
    workspaceId,
    fieldUniversalIdentifier,
  }: {
    workspaceId: string;
    fieldUniversalIdentifier: string;
  }): Promise<PersonHandleField | null> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const fieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: fieldUniversalIdentifier,
    });

    if (
      !isDefined(fieldMetadata) ||
      !fieldMetadata.isActive ||
      fieldMetadata.objectMetadataUniversalIdentifier !==
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person
    ) {
      return null;
    }

    const type = toPersonHandleFieldType(fieldMetadata.type);

    return isDefined(type) ? { name: fieldMetadata.name, type } : null;
  }
}
