import { FieldMetadataType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildRawLabelByRecordId } from 'src/modules/dashboard/chart-data/utils/build-raw-label-by-record-id.util';

const labelFieldMetadataId = 'label-field-id';

const buildFlatFieldMetadataMaps = (labelField: Partial<FlatFieldMetadata>) =>
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [
      getFlatFieldMetadataMock({
        id: labelFieldMetadataId,
        universalIdentifier: 'label-field-universal-id',
        objectMetadataId: 'target-object-id',
        type: FieldMetadataType.TEXT,
        ...labelField,
      }),
    ],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const targetFlatObjectMetadata = getFlatObjectMetadataMock({
  id: 'target-object-id',
  universalIdentifier: 'target-object-universal-id',
  nameSingular: 'agent',
  labelIdentifierFieldMetadataId: labelFieldMetadataId,
});

describe('buildRawLabelByRecordId', () => {
  it('should build labels from a TEXT label identifier', () => {
    const rawLabelByRecordId = buildRawLabelByRecordId({
      records: [
        { id: 'agent-id-1', name: 'Alice' },
        { id: 'agent-id-2', name: 'Bob' },
      ],
      targetFlatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
    });

    expect(rawLabelByRecordId.get('agent-id-1')).toBe('Alice');
    expect(rawLabelByRecordId.get('agent-id-2')).toBe('Bob');
  });

  it('should join FULL_NAME subfields into a single label', () => {
    const rawLabelByRecordId = buildRawLabelByRecordId({
      records: [
        { id: 'agent-id-1', name: { firstName: 'Alice', lastName: 'Ng' } },
      ],
      targetFlatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      }),
    });

    expect(rawLabelByRecordId.get('agent-id-1')).toBe('Alice Ng');
  });

  it('should skip records whose label identifier value is empty', () => {
    const rawLabelByRecordId = buildRawLabelByRecordId({
      records: [{ id: 'agent-id-1', name: null }],
      targetFlatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
        name: 'name',
        type: FieldMetadataType.TEXT,
      }),
    });

    expect(rawLabelByRecordId.has('agent-id-1')).toBe(false);
  });

  it('should keep a UUID label whose value equals the record id', () => {
    const rawLabelByRecordId = buildRawLabelByRecordId({
      records: [{ id: 'agent-id-1', externalId: 'agent-id-1' }],
      targetFlatObjectMetadata,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps({
        name: 'externalId',
        type: FieldMetadataType.UUID,
      }),
    });

    expect(rawLabelByRecordId.get('agent-id-1')).toBe('agent-id-1');
  });
});
