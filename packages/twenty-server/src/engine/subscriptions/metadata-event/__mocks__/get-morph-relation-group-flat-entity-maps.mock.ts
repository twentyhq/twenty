import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type ScalarFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/scalar-flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';

export const NOTE_TARGET_OBJECT_METADATA_ID = 'note-target-object-id';
export const NOTE_TARGET_MORPH_ID = 'note-target-morph-id';
export const NOTE_TARGET_NOTE_FIELD_ID = 'note-target-note-field-id';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';

type MorphRowMock = {
  id: string;
  targetNameSingular: string;
  isActive?: boolean;
  label?: string;
};

const toFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

// Mirrors noteTarget.target: one MORPH_RELATION row per target object, each
// with its inverse ONE_TO_MANY field on the target object
export const getMorphRelationGroupFlatEntityMapsMock = (
  morphRows: MorphRowMock[],
) => {
  const flatFieldMetadatas: FlatFieldMetadata[] = [];
  const targetFlatObjectMetadatas: FlatObjectMetadata[] = [];

  const noteFlatFieldMetadata = getFlatFieldMetadataMock({
    id: NOTE_TARGET_NOTE_FIELD_ID,
    universalIdentifier: NOTE_TARGET_NOTE_FIELD_ID,
    workspaceId: WORKSPACE_ID,
    applicationId: APPLICATION_ID,
    objectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
    type: FieldMetadataType.UUID,
    name: 'noteId',
  });

  flatFieldMetadatas.push(noteFlatFieldMetadata);

  for (const { id, targetNameSingular, isActive = true, label } of morphRows) {
    const targetObjectMetadataId = `${targetNameSingular}-object-id`;
    const inverseFieldMetadataId = `${targetNameSingular}-note-targets-field-id`;
    const capitalizedTargetName = capitalize(targetNameSingular);

    flatFieldMetadatas.push(
      getFlatFieldMetadataMock({
        id,
        universalIdentifier: id,
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        objectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
        type: FieldMetadataType.MORPH_RELATION,
        name: `target${capitalizedTargetName}`,
        label: label ?? 'Target',
        isActive,
        morphId: NOTE_TARGET_MORPH_ID,
        relationTargetObjectMetadataId: targetObjectMetadataId,
        relationTargetFieldMetadataId: inverseFieldMetadataId,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: `target${capitalizedTargetName}Id`,
        },
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: `target${capitalizedTargetName}Id`,
        },
      }),
      getFlatFieldMetadataMock({
        id: inverseFieldMetadataId,
        universalIdentifier: inverseFieldMetadataId,
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        objectMetadataId: targetObjectMetadataId,
        type: FieldMetadataType.RELATION,
        name: 'noteTargets',
        relationTargetObjectMetadataId: NOTE_TARGET_OBJECT_METADATA_ID,
        relationTargetFieldMetadataId: id,
        settings: { relationType: RelationType.ONE_TO_MANY },
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      }),
    );

    targetFlatObjectMetadatas.push(
      getFlatObjectMetadataMock({
        id: targetObjectMetadataId,
        universalIdentifier: targetObjectMetadataId,
        nameSingular: targetNameSingular,
        namePlural: `${targetNameSingular}s`,
        fieldIds: [inverseFieldMetadataId],
      }),
    );
  }

  const noteTargetFlatObjectMetadata = getFlatObjectMetadataMock({
    id: NOTE_TARGET_OBJECT_METADATA_ID,
    universalIdentifier: NOTE_TARGET_OBJECT_METADATA_ID,
    nameSingular: 'noteTarget',
    namePlural: 'noteTargets',
    fieldIds: [
      NOTE_TARGET_NOTE_FIELD_ID,
      ...morphRows.map((morphRow) => morphRow.id),
    ],
  });

  const flatFieldMetadataMaps = toFlatEntityMaps(flatFieldMetadatas);

  const getScalarFlatFieldMetadata = (
    fieldMetadataId: string,
  ): ScalarFlatEntity<MetadataEntity<'fieldMetadata'>> => {
    const flatFieldMetadata = flatFieldMetadatas.find(
      ({ id }) => id === fieldMetadataId,
    );

    if (!isDefined(flatFieldMetadata)) {
      throw new Error(`Unknown field metadata mock ${fieldMetadataId}`);
    }

    return flatEntityToScalarFlatEntity({
      metadataName: 'fieldMetadata',
      flatEntity: flatFieldMetadata,
    });
  };

  return {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps: toFlatEntityMaps([
      noteTargetFlatObjectMetadata,
      ...targetFlatObjectMetadatas,
    ]),
    getScalarFlatFieldMetadata,
  };
};
