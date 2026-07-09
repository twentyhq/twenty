import {
  computeUpdatedFieldsFromDiff,
  objectRecordChangedValues,
} from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildUpdatedRecordsForEvent } from 'src/engine/twenty-orm/utils/build-updated-records-for-event.util';

const mockObjectMetadata = {
  id: '1',
  nameSingular: 'workspaceMember',
  namePlural: 'workspaceMembers',
  fieldIds: [],
} as unknown as FlatObjectMetadata;

const mockFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

describe('buildUpdatedRecordsForEvent', () => {
  it('keeps untouched fields at their before value, so a partial update does not report them as changed', () => {
    const recordBefore = {
      id: 'r1',
      name: 'Old Name',
      avatarUrl: 'http://localhost:3000/file/core-picture/abc',
      userEmail: 'tim@apple.dev',
    };
    // TypeORM null-injects untouched nullable columns, which formatResult turns into empty strings.
    const persistedRecord = {
      id: 'r1',
      name: 'New Name',
      avatarUrl: '',
      userEmail: '',
      updatedAt: '2020-01-02T00:00:00.000Z',
    };

    const { recordsAfter, recordsBefore } = buildUpdatedRecordsForEvent({
      persistedRecords: [persistedRecord],
      writtenColumnNamesByRecordIndex: [['id', 'name']],
      recordsBeforeUpdateById: { r1: recordBefore },
      objectMetadataItem: mockObjectMetadata,
      flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
    });

    expect(recordsAfter).toHaveLength(1);
    expect(recordsAfter[0].avatarUrl).toBe(
      'http://localhost:3000/file/core-picture/abc',
    );
    expect(recordsAfter[0].userEmail).toBe('tim@apple.dev');
    expect(recordsAfter[0].name).toBe('New Name');
    expect(recordsAfter[0].updatedAt).toBe('2020-01-02T00:00:00.000Z');

    const diff = objectRecordChangedValues(
      recordsBefore[0],
      recordsAfter[0],
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );
    const updatedFields = computeUpdatedFieldsFromDiff(
      diff,
      mockObjectMetadata,
      mockFlatFieldMetadataMaps,
    );

    expect(updatedFields).toEqual(['name']);
  });

  it('overlays genuinely written fields with their persisted value', () => {
    const recordBefore = {
      id: 'r1',
      avatarUrl: 'http://localhost:3000/file/core-picture/old',
    };
    const persistedRecord = {
      id: 'r1',
      avatarUrl: 'http://localhost:3000/file/core-picture/new',
    };

    const { recordsAfter } = buildUpdatedRecordsForEvent({
      persistedRecords: [persistedRecord],
      writtenColumnNamesByRecordIndex: [['id', 'avatarUrl']],
      recordsBeforeUpdateById: { r1: recordBefore },
      objectMetadataItem: mockObjectMetadata,
      flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
    });

    expect(recordsAfter[0].avatarUrl).toBe(
      'http://localhost:3000/file/core-picture/new',
    );
  });

  it('skips created records that have no before row', () => {
    const { recordsAfter, recordsBefore } = buildUpdatedRecordsForEvent({
      persistedRecords: [{ id: 'created-1', name: 'X' }],
      writtenColumnNamesByRecordIndex: [['id', 'name']],
      recordsBeforeUpdateById: {},
      objectMetadataItem: mockObjectMetadata,
      flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
    });

    expect(recordsAfter).toHaveLength(0);
    expect(recordsBefore).toHaveLength(0);
  });
});
