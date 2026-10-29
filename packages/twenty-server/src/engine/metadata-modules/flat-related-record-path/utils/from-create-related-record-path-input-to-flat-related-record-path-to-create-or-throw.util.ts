/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type CreateRelatedRecordPathInput } from 'src/engine/metadata-modules/related-record-path/dtos/create-related-record-path.input';
import {
  RelatedRecordPathException,
  RelatedRecordPathExceptionCode,
} from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';

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
      'sourceObjectMetadataId' | 'fieldMetadataIds'
    >;
    workspaceId: string;
    flatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  } & Pick<
    AllFlatEntityMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >): FlatRelatedRecordPath => {
    const { sourceObjectMetadataId, fieldMetadataIds } =
      createRelatedRecordPathInput;
    const [firstFieldMetadataId, secondFieldMetadataId, thirdFieldMetadataId] =
      fieldMetadataIds;

    const lastFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataIds[fieldMetadataIds.length - 1],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const targetObjectMetadataId =
      lastFlatFieldMetadata?.relationTargetObjectMetadataId;

    if (!isDefined(targetObjectMetadataId)) {
      throw new RelatedRecordPathException(
        'Related record path must end with a relation field',
        RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT,
      );
    }

    const foreignKeyValues = {
      sourceObjectMetadataId,
      targetObjectMetadataId,
      firstFieldMetadataId,
      secondFieldMetadataId: secondFieldMetadataId ?? null,
      thirdFieldMetadataId: thirdFieldMetadataId ?? null,
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
