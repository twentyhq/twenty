/* @license Enterprise */

import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type CreateRelatedRecordPathInput } from 'src/engine/metadata-modules/related-record-path/dtos/create-related-record-path.input';

export const fromCreateRelatedRecordPathInputToFlatRelatedRecordPathToCreateOrThrow =
  ({
    createRelatedRecordPathInput,
    workspaceId,
    flatApplication,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    createRelatedRecordPathInput: Pick<
      CreateRelatedRecordPathInput,
      | 'objectMetadataId'
      | 'firstFieldMetadataId'
      | 'secondFieldMetadataId'
      | 'thirdFieldMetadataId'
      | 'fourthFieldMetadataId'
    >;
    workspaceId: string;
    flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >): FlatRelatedRecordPath => {
    const foreignKeyValues = {
      objectMetadataId: createRelatedRecordPathInput.objectMetadataId,
      firstFieldMetadataId: createRelatedRecordPathInput.firstFieldMetadataId,
      secondFieldMetadataId:
        createRelatedRecordPathInput.secondFieldMetadataId ?? null,
      thirdFieldMetadataId:
        createRelatedRecordPathInput.thirdFieldMetadataId ?? null,
      fourthFieldMetadataId:
        createRelatedRecordPathInput.fourthFieldMetadataId ?? null,
    };

    const relationUniversalIdentifiers =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'relatedRecordPath',
        foreignKeyValues,
        flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      });

    const id = v4();
    const now = new Date().toISOString();

    return {
      id,
      universalIdentifier: id,
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      ...foreignKeyValues,
      ...relationUniversalIdentifiers,
      createdAt: now,
      updatedAt: now,
    };
  };
