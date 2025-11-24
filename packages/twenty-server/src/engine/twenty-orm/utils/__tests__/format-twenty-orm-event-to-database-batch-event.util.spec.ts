import { FieldMetadataType } from 'twenty-shared/types';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';
import { getMockObjectMetadataItemWithFieldsMaps } from 'src/utils/__test__/get-object-metadata-item-with-fields-maps.mock';

describe('formatTwentyOrmEventToDatabaseBatchEvent', () => {
  const objectMetadataItemWithFieldMaps =
    getMockObjectMetadataItemWithFieldsMaps({
      id: 'object-id',
      workspaceId: 'workspace-id',
      nameSingular: 'person',
      namePlural: 'people',
      indexMetadatas: [],
      fieldIdByJoinColumnName: {},
      fieldIdByName: {
        name: 'name-id',
        age: 'age-id',
        fullName: 'fullname-id',
      },
      fieldsById: {
        'name-id': getMockFieldMetadataEntity({
          workspaceId: 'workspace-id',
          objectMetadataId: 'object-id',
          id: 'name-id',
          type: FieldMetadataType.TEXT,
          name: 'name',
          label: 'Name',
          isLabelSyncedWithName: true,
          isNullable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    });

  const mockWorkspaceId = 'workspace-id';
  const mockAuthContext = {
    user: { id: 'user-id' },
    workspaceMemberId: 'workspace-member-id',
  } as any;

  describe('UPDATED action', () => {
    it('should throw TwentyORMException when no matching before entity is found in array of beforeEntities', () => {
      const afterEntities = [
        {
          id: 'record-1',
          name: 'John Doe Updated',
        },
        {
          id: 'record-2',
          name: 'Jane Doe Updated',
        },
      ];

      const beforeEntities = [
        {
          id: 'record-1',
          name: 'John Doe',
        },
        {
          id: 'record-3',
          name: 'Bob Smith',
        },
      ];

      try {
        formatTwentyOrmEventToDatabaseBatchEvent({
          action: DatabaseEventAction.UPDATED,
          objectMetadataItem: objectMetadataItemWithFieldMaps,
          workspaceId: mockWorkspaceId,
          authContext: mockAuthContext,
          entities: afterEntities,
          beforeEntities: beforeEntities,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(TwentyORMException);
        expect((error as TwentyORMException).code).toBe(
          TwentyORMExceptionCode.ORM_EVENT_DATA_CORRUPTED,
        );
        expect((error as TwentyORMException).message).toBe(
          'Record mismatch detected while computing event data for UPDATED action',
        );
      }
    });

    it('should successfully create update events when matching before entities are found and in the right order', () => {
      const afterEntities = [
        {
          id: 'record-1',
          name: 'John Doe Updated',
        },
        {
          id: 'record-2',
          name: 'Jane Doe Updated',
        },
      ];

      const beforeEntities = [
        {
          id: 'record-2',
          name: 'Jane Doe',
        },
        {
          id: 'record-1',
          name: 'John Doe',
        },
      ];

      const result = formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadataItem: objectMetadataItemWithFieldMaps,
        workspaceId: mockWorkspaceId,
        authContext: mockAuthContext,
        entities: afterEntities,
        beforeEntities: beforeEntities,
      });

      expect(result).toBeDefined();
      expect(result?.action).toBe(DatabaseEventAction.UPDATED);
      expect(result?.events).toHaveLength(2);

      const updateEvent1 = result?.events[0] as ObjectRecordUpdateEvent<
        (typeof afterEntities)[0]
      >;
      const updateEvent2 = result?.events[1] as ObjectRecordUpdateEvent<
        (typeof afterEntities)[1]
      >;

      expect(updateEvent1.recordId).toBe('record-1');
      expect(updateEvent2.recordId).toBe('record-2');

      expect(updateEvent1.properties?.before?.name).toBe('John Doe');
      expect(updateEvent1.properties?.after?.name).toBe('John Doe Updated');
      expect(updateEvent2.properties?.before?.name).toBe('Jane Doe');
      expect(updateEvent2.properties?.after?.name).toBe('Jane Doe Updated');
    });

    it('should handle single entity (non-array) for both before and after', () => {
      const afterEntity = {
        id: 'record-1',
        name: 'John Doe Updated',
      };

      const beforeEntity = {
        id: 'record-1',
        name: 'John Doe',
      };

      const result = formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadataItem: objectMetadataItemWithFieldMaps,
        workspaceId: mockWorkspaceId,
        authContext: mockAuthContext,
        entities: afterEntity,
        beforeEntities: beforeEntity,
      });

      expect(result).toBeDefined();
      expect(result?.action).toBe(DatabaseEventAction.UPDATED);
      expect(result?.events).toHaveLength(1);
      expect(result?.events[0].recordId).toBe('record-1');
    });
  });
});
