import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { PERSON_HANDLE_FIELD_TYPES } from 'src/modules/match-participant/person-handle-field/constants/person-handle-field-types.constant';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';

const isPersonHandleFieldType = (
  type: string,
): type is PersonHandleField['type'] =>
  (PERSON_HANDLE_FIELD_TYPES as readonly string[]).includes(type);

@Injectable()
export class PersonHandleFieldService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  // null when the field is missing, deleted, not on person or of a type handles cannot be matched against
  async findByUniversalIdentifier({
    workspaceId,
    fieldUniversalIdentifier,
  }: {
    workspaceId: string;
    fieldUniversalIdentifier: string;
  }): Promise<PersonHandleField | null> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const personObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person
      ];
    const fieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier];

    if (
      !isDefined(personObjectMetadata) ||
      !isDefined(fieldMetadata) ||
      fieldMetadata.objectMetadataId !== personObjectMetadata.id ||
      !fieldMetadata.isActive ||
      !isPersonHandleFieldType(fieldMetadata.type)
    ) {
      return null;
    }

    return { name: fieldMetadata.name, type: fieldMetadata.type };
  }
}
