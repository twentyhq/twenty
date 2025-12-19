import { FieldMetadataType } from 'twenty-shared/types';
import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';

describe('formatTwentyOrmEventToDatabaseBatchEvent', () => {
  const workspaceId = 'workspace-id';
  const objectMetadataId = 'object-id';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      objectMetadataId,
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      viewFieldIds: [],
      viewFilterIds: [],
      viewGroupIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const nameField = createMockField({
    id: 'name-id',
    type: FieldMetadataType.TEXT,
    name: 'name',
    label: 'Name',
  });

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byId: {
      'name-id': nameField,
    },
    idByUniversalIdentifier: {
      'name-id': 'name-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const flatObjectMetadata: FlatObjectMetadata = {
    id: objectMetadataId,
    workspaceId,
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: objectMetadataId,
    fieldMetadataIds: ['name-id'],
    indexMetadataIds: [],
    viewIds: [],
    applicationId: null,
  } as unknown as FlatObjectMetadata;

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
          objectMetadataItem: flatObjectMetadata,
          flatFieldMetadataMaps,
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
        objectMetadataItem: flatObjectMetadata,
        flatFieldMetadataMaps,
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
        objectMetadataItem: flatObjectMetadata,
        flatFieldMetadataMaps,
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
