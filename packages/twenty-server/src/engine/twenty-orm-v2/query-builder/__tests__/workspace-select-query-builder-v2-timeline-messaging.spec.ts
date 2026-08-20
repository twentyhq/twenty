import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {
  SCHEMA_NAME,
  buildColumn,
} from 'src/engine/twenty-orm-v2/query-builder/__tests__/workspace-select-query-builder-v2-test-shapes.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

describe('WorkspaceSelectQueryBuilderV2 timeline messaging parity', () => {
  const buildShape = (
    objectMetadataId: string,
    nameSingular: string,
    columnNames: string[],
    relationShapeByFieldName: WorkspaceTableShape['relationShapeByFieldName'],
  ): WorkspaceTableShape => ({
    objectMetadataId,
    nameSingular,
    schemaName: SCHEMA_NAME,
    tableName: nameSingular,
    columnShapeByColumnName: Object.fromEntries(
      columnNames.map((columnName) => [columnName, buildColumn(columnName)]),
    ),
    columnNames,
    relationShapeByFieldName,
    hasDeletedAtColumn: true,
  });

  const messageThreadShape = buildShape(
    'thread-id',
    'messageThread',
    ['id', 'deletedAt'],
    {
      messages: {
        fieldName: 'messages',
        fieldMetadataId: 'field-thread-messages',
        relationType: RelationType.ONE_TO_MANY,
        targetObjectMetadataId: 'message-id',
        targetFieldMetadataId: 'field-message-thread',
      },
    },
  );

  const messageShape = buildShape(
    'message-id',
    'message',
    ['id', 'messageThreadId', 'receivedAt', 'deletedAt'],
    {
      messageThread: {
        fieldName: 'messageThread',
        fieldMetadataId: 'field-message-thread',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'thread-id',
        targetFieldMetadataId: 'field-thread-messages',
        joinColumnName: 'messageThreadId',
      },
      messageParticipants: {
        fieldName: 'messageParticipants',
        fieldMetadataId: 'field-message-participants',
        relationType: RelationType.ONE_TO_MANY,
        targetObjectMetadataId: 'participant-id',
        targetFieldMetadataId: 'field-participant-message',
      },
      messageChannelMessageAssociations: {
        fieldName: 'messageChannelMessageAssociations',
        fieldMetadataId: 'field-message-associations',
        relationType: RelationType.ONE_TO_MANY,
        targetObjectMetadataId: 'association-id',
        targetFieldMetadataId: 'field-association-message',
      },
    },
  );

  const messageParticipantShape = buildShape(
    'participant-id',
    'messageParticipant',
    [
      'id',
      'messageId',
      'personId',
      'workspaceMemberId',
      'role',
      'handle',
      'deletedAt',
    ],
    {
      message: {
        fieldName: 'message',
        fieldMetadataId: 'field-participant-message',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'message-id',
        targetFieldMetadataId: 'field-message-participants',
        joinColumnName: 'messageId',
      },
      person: {
        fieldName: 'person',
        fieldMetadataId: 'field-participant-person',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'timeline-person-id',
        targetFieldMetadataId: null,
        joinColumnName: 'personId',
      },
      workspaceMember: {
        fieldName: 'workspaceMember',
        fieldMetadataId: 'field-participant-member',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'member-id',
        targetFieldMetadataId: null,
        joinColumnName: 'workspaceMemberId',
      },
    },
  );

  const timelinePersonShape = buildShape(
    'timeline-person-id',
    'person',
    ['id', 'nameFirstName', 'avatarUrl', 'deletedAt'],
    {},
  );

  const workspaceMemberShape = buildShape(
    'member-id',
    'workspaceMember',
    ['id', 'nameFirstName', 'avatarUrl', 'deletedAt'],
    {},
  );

  const associationShape = buildShape(
    'association-id',
    'messageChannelMessageAssociation',
    ['id', 'messageId', 'messageChannelId', 'deletedAt'],
    {
      message: {
        fieldName: 'message',
        fieldMetadataId: 'field-association-message',
        relationType: RelationType.MANY_TO_ONE,
        targetObjectMetadataId: 'message-id',
        targetFieldMetadataId: 'field-message-associations',
        joinColumnName: 'messageId',
      },
    },
  );

  const shapeByObjectMetadataId: Record<string, WorkspaceTableShape> = {
    'thread-id': messageThreadShape,
    'message-id': messageShape,
    'participant-id': messageParticipantShape,
    'timeline-person-id': timelinePersonShape,
    'member-id': workspaceMemberShape,
    'association-id': associationShape,
  };

  const buildTimelineQueryBuilder = (
    alias: string,
    tableShape: WorkspaceTableShape,
    rows: Record<string, unknown>[] = [],
  ) => {
    const executedStatements: CompiledStatement[] = [];

    const queryBuilder = new WorkspaceSelectQueryBuilderV2(alias, {
      tableShape,
      executor: {
        execute: async (statement) => {
          executedStatements.push(statement);

          return rows;
        },
      },
      objectRecordsPermissions: {},
      tableShapeByObjectMetadataId: (objectMetadataId) =>
        shapeByObjectMetadataId[objectMetadataId],
      onBeforeExecute: () => undefined,
      formatResult: (records) => records as never,
    });

    return { queryBuilder, executedStatements };
  };

  it('should count threads across two to-many inner joins', async () => {
    const { queryBuilder, executedStatements } = buildTimelineQueryBuilder(
      'messageThread',
      messageThreadShape,
      [{ count: '2' }],
    );

    const count = await queryBuilder
      .innerJoin('messageThread.messages', 'messages')
      .innerJoin('messages.messageParticipants', 'messageParticipants')
      .where('messageParticipants.personId IN(:...personIds)', {
        personIds: ['person-1'],
      })
      .groupBy('messageThread.id')
      .getCount();

    expect(count).toBe(2);

    const sql = executedStatements[0].text;

    expect(sql).toContain('SELECT COUNT(DISTINCT "messageThread"."id")');
    expect(sql).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."message" AS "messages" ` +
        'ON ("messages"."messageThreadId" = "messageThread"."id")',
    );
    expect(sql).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."messageParticipant" AS "messageParticipants" ` +
        'ON ("messageParticipants"."messageId" = "messages"."id")',
    );
    expect(sql).toContain('"messageParticipants"."personId" IN($1)');
  });

  it('should page thread ids ordered by an aggregate select alias', async () => {
    const { queryBuilder, executedStatements } = buildTimelineQueryBuilder(
      'messageThread',
      messageThreadShape,
      [{ id: 'thread-1', max_received_at: new Date('2026-01-01') }],
    );

    const rows = await queryBuilder
      .select('messageThread.id', 'id')
      .addSelect('MAX(messages.receivedAt)', 'max_received_at')
      .innerJoin('messageThread.messages', 'messages')
      .innerJoin('messages.messageParticipants', 'messageParticipants')
      .where('messageParticipants.personId IN (:...personIds)', {
        personIds: ['person-1'],
      })
      .groupBy('messageThread.id')
      .orderBy('max_received_at', 'DESC')
      .offset(3)
      .limit(6)
      .getRawMany();

    expect(rows[0]).toEqual({
      id: 'thread-1',
      max_received_at: new Date('2026-01-01'),
    });

    const sql = executedStatements[0].text;

    expect(sql).toContain(
      'SELECT "messageThread"."id" AS "id", ' +
        'MAX("messages"."receivedAt") AS "max_received_at"',
    );
    expect(sql).toContain('GROUP BY "messageThread"."id"');
    expect(sql).toContain('ORDER BY "max_received_at" DESC');
    expect(sql).toContain('LIMIT $');
    expect(sql).toContain('OFFSET $');
  });

  it('should load distinct thread participants with hydrated relations', async () => {
    const receivedAt = new Date('2026-02-02');
    const { queryBuilder, executedStatements } = buildTimelineQueryBuilder(
      'messageParticipant',
      messageParticipantShape,
      [
        {
          messageParticipant_id: 'participant-1',
          messageParticipant_messageId: 'message-1',
          messageParticipant_personId: 'person-1',
          messageParticipant_workspaceMemberId: null,
          messageParticipant_role: 'from',
          messageParticipant_handle: 'ada@acme.dev',
          messageParticipant_deletedAt: null,
          person_id: 'person-1',
          person_nameFirstName: 'Ada',
          person_avatarUrl: '',
          person_deletedAt: null,
          workspaceMember_id: null,
          workspaceMember_nameFirstName: null,
          workspaceMember_avatarUrl: null,
          workspaceMember_deletedAt: null,
          message_messageThreadId: 'thread-1',
          message_receivedAt: receivedAt,
        },
      ],
    );

    const participants = await queryBuilder
      .select('messageParticipant')
      .addSelect('message.messageThreadId')
      .addSelect('message.receivedAt')
      .leftJoinAndSelect('messageParticipant.person', 'person')
      .leftJoinAndSelect(
        'messageParticipant.workspaceMember',
        'workspaceMember',
      )
      .leftJoin('messageParticipant.message', 'message')
      .where('message.messageThreadId = ANY(:messageThreadIds)', {
        messageThreadIds: ['thread-1'],
      })
      .andWhere('messageParticipant.role = :role', { role: 'from' })
      .orderBy('message.messageThreadId')
      .distinctOn(['message.messageThreadId', 'messageParticipant.handle'])
      .getMany();

    expect(participants).toEqual([
      {
        id: 'participant-1',
        messageId: 'message-1',
        personId: 'person-1',
        workspaceMemberId: null,
        role: 'from',
        handle: 'ada@acme.dev',
        deletedAt: null,
        person: {
          id: 'person-1',
          nameFirstName: 'Ada',
          avatarUrl: '',
          deletedAt: null,
        },
        workspaceMember: null,
        message: { messageThreadId: 'thread-1', receivedAt },
      },
    ]);

    const sql = executedStatements[0].text;

    expect(sql).toContain(
      'SELECT DISTINCT ON ("message"."messageThreadId", "messageParticipant"."handle")',
    );
    expect(sql).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."person" AS "person" ` +
        'ON ("messageParticipant"."personId" = "person"."id")',
    );
    expect(sql).toContain('"message"."messageThreadId" = ANY($1)');
    expect(sql).toContain('("messageParticipant"."role" = $2)');
    expect(sql).toContain('ORDER BY "message"."messageThreadId" ASC');
  });

  it('should map thread visibility rows through raw to-many left joins', async () => {
    const { queryBuilder, executedStatements } = buildTimelineQueryBuilder(
      'messageThread',
      messageThreadShape,
      [{ id: 'thread-1', messageChannelId: 'channel-1' }],
    );

    const rows = await queryBuilder
      .select('messageThread.id', 'id')
      .addSelect(
        'messageChannelMessageAssociation.messageChannelId',
        'messageChannelId',
      )
      .leftJoin('messageThread.messages', 'message')
      .leftJoin(
        'message.messageChannelMessageAssociations',
        'messageChannelMessageAssociation',
      )
      .where('messageThread.id = ANY(:messageThreadIds)', {
        messageThreadIds: ['thread-1'],
      })
      .getRawMany();

    expect(rows).toEqual([{ id: 'thread-1', messageChannelId: 'channel-1' }]);

    const sql = executedStatements[0].text;

    expect(sql).toContain(
      'SELECT "messageThread"."id" AS "id", ' +
        '"messageChannelMessageAssociation"."messageChannelId" AS "messageChannelId"',
    );
    expect(sql).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."message" AS "message" ` +
        'ON ("message"."messageThreadId" = "messageThread"."id")',
    );
    expect(sql).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."messageChannelMessageAssociation" ` +
        'AS "messageChannelMessageAssociation" ' +
        'ON ("messageChannelMessageAssociation"."messageId" = "message"."id")',
    );
    expect(sql).toContain('"messageThread"."id" = ANY($1)');
  });
});
