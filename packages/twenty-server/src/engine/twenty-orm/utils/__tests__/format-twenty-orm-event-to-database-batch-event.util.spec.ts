import { FieldMetadataType } from 'twenty-shared/types';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
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
          email: 'john.updated@example.com',
        },
        {
          id: 'record-2',
          name: 'Jane Doe Updated',
          email: 'jane.updated@example.com',
        },
      ];

      const beforeEntities = [
        {
          id: 'record-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        {
          id: 'record-3',
          name: 'Bob Smith',
          email: 'bob@example.com',
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

    it('should successfully create update events when matching before entities are found', () => {
      const afterEntities = [
        {
          id: 'record-1',
          name: 'John Doe Updated',
          email: 'john.updated@example.com',
        },
      ];

      const beforeEntities = [
        {
          id: 'record-1',
          name: 'John Doe',
          email: 'john@example.com',
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
      expect(result?.events).toHaveLength(1);
      expect(result?.events[0].recordId).toBe('record-1');
      expect(result?.events[0].userId).toBe('user-id');
      expect(result?.events[0].workspaceMemberId).toBe('workspace-member-id');
    });

    it('should handle single entity (non-array) for both before and after', () => {
      const afterEntity = {
        id: 'record-1',
        name: 'John Doe Updated',
        email: 'john.updated@example.com',
      };

      const beforeEntity = {
        id: 'record-1',
        name: 'John Doe',
        email: 'john@example.com',
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
