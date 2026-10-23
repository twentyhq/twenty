import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { PERSON_HANDLE_FIELD_TYPES } from 'src/modules/match-participant/person-handle-field/constants/person-handle-field-types.constant';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

type PersonHandleFieldWithUniversalIdentifier = PersonHandleField & {
  universalIdentifier: string;
};

const toPersonHandleFieldType = (
  type: string,
): PersonHandleField['type'] | undefined =>
  PERSON_HANDLE_FIELD_TYPES.find((handleFieldType) => handleFieldType === type);

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

    const personObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person
      ];

    if (!isDefined(personObjectMetadata)) {
      return [];
    }

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
    const personHandleField = (await this.findAll(workspaceId)).find(
      (field) => field.universalIdentifier === fieldUniversalIdentifier,
    );

    return isDefined(personHandleField)
      ? { name: personHandleField.name, type: personHandleField.type }
      : null;
  }
}
