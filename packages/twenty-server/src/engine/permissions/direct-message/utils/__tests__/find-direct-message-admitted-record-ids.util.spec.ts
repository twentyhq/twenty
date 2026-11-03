import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import {
  type PermissionsMetadataMaps,
  type PermissionsRowAccessEvaluationRequest,
  type RowAccessEvaluationContext,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { resolveEventRecordAccessSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-access-snapshots.util';
import { DIRECT_MESSAGE_ROW_ACCESS_POLICY } from 'src/engine/metadata-modules/ai/ai-chat/row-access/direct-message-row-access-policy';
import { type DirectMessagePermissionObject } from 'src/engine/permissions/direct-message/types/direct-message-permission-object.type';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { findDirectMessageAdmittedRecordIds } from 'src/engine/permissions/direct-message/utils/find-direct-message-admitted-record-ids.util';
import { validateDirectMessageRecordsForWriteOrThrow } from 'src/engine/permissions/direct-message/utils/validate-direct-message-records-for-write-or-throw.util';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';

const MEMBER_ID = 'member-one';
const PEER_ID = 'member-two';
const OUTSIDER_ID = 'outsider';
const DIRECT_MESSAGE_ID = 'direct-message';
const REGULAR_THREAD_ID = 'regular-thread';
const ROLE_ID = 'member-role';
const directMessagePair: DirectMessageThreadPair = {
  conversationType: 'DIRECT_MESSAGE',
  directMessageFirstWorkspaceMemberId: MEMBER_ID,
  directMessageSecondWorkspaceMemberId: PEER_ID,
};
const regularThreadPair: DirectMessageThreadPair = {
  conversationType: 'STANDARD',
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
};
const fullAccess = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const buildRequest = ({
  objectName = 'agentChatThread',
  workspaceMemberId = MEMBER_ID,
}: {
  objectName?: DirectMessagePermissionObject;
  workspaceMemberId?: string;
} = {}): PermissionsRowAccessEvaluationRequest => {
  const flatObjectMetadata = getFlatObjectMetadataMock({
    id: 'object-id',
    nameSingular: objectName,
    universalIdentifier: STANDARD_OBJECTS[objectName].universalIdentifier,
    fieldIds: [],
  });
  const conversationTypeField = getFlatFieldMetadataMock({
    objectMetadataId: flatObjectMetadata.id,
    type: FieldMetadataType.SELECT,
    name: 'conversationType',
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThread.fields.conversationType
        .universalIdentifier,
  });
  const metadataMaps: PermissionsMetadataMaps = {
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: conversationTypeField,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    }),
    rolesPermissions: {
      [ROLE_ID]: { [flatObjectMetadata.id]: fullAccess },
    },
    flatApplicationMaps: { byId: {} },
    flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
    flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
    featureFlagsMap: {
      [FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED]: true,
      [FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED]: true,
      [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
    },
  };
  const context: RowAccessEvaluationContext = {
    shouldIgnoreSoftDeleteDefaultFilter: true,
    fetchRecordShares: async () => [],
    findPrivateRecordStates: async () => new Map(),
    findRecords: async ({ objectUniversalIdentifier }) =>
      objectUniversalIdentifier ===
      STANDARD_OBJECTS.agentMessage.universalIdentifier
        ? [{ id: 'message-id', threadId: DIRECT_MESSAGE_ID }]
        : [
            { id: DIRECT_MESSAGE_ID, ...directMessagePair },
            { id: REGULAR_THREAD_ID, ...regularThreadPair },
          ],
    findAdmittedRecordIds: async () => new Set([DIRECT_MESSAGE_ID]),
  };

  return {
    principal: {
      workspaceId: 'workspace-id',
      mainPrincipal: {
        type: 'workspaceMember',
        roleId: ROLE_ID,
        workspaceMemberId,
      },
      applicationPrincipal: { type: 'customApplication' },
    },
    flatObjectMetadata,
    metadataMaps,
    records: [
      { id: DIRECT_MESSAGE_ID, ...directMessagePair },
      { id: REGULAR_THREAD_ID, ...regularThreadPair },
    ],
    operationType: 'select',
    context,
  };
};

describe('direct message record admission', () => {
  it('keeps canonical DMs behind their legacy shares before private records are enabled', async () => {
    const request = buildRequest();

    request.metadataMaps.featureFlagsMap[
      FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED
    ] = false;

    expect(await findPermissionsAdmittedRecordIds(request)).toEqual(new Set());

    request.context.fetchRecordShares = async () => [
      {
        recordId: DIRECT_MESSAGE_ID,
        principalId: MEMBER_ID,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      },
    ];

    expect(await findPermissionsAdmittedRecordIds(request)).toEqual(
      new Set([DIRECT_MESSAGE_ID]),
    );
  });

  it.each([
    'agentChatThreadParticipant',
    'agentChatThreadTarget',
    'agentMessage',
    'agentTurn',
  ] as const)('requires parent access for %s snapshots', async (objectName) => {
    const request = buildRequest({ objectName });

    request.records = [
      { id: 'dm-child', threadId: DIRECT_MESSAGE_ID },
      { id: 'ordinary-child', threadId: REGULAR_THREAD_ID },
    ];
    request.context.findAdmittedRecordIds = async () => new Set();

    expect(await findDirectMessageAdmittedRecordIds(request)).toEqual(
      new Set(['ordinary-child']),
    );
  });

  it.each(['agentMessagePart', 'agentMessageReaction'] as const)(
    'resolves %s snapshots through their message and denies outsiders',
    async (objectName) => {
      const request = buildRequest({
        objectName,
        workspaceMemberId: OUTSIDER_ID,
      });

      request.records = [{ id: 'message-child', messageId: 'message-id' }];

      expect(await findDirectMessageAdmittedRecordIds(request)).toEqual(
        new Set(),
      );
    },
  );

  it('requires write access when a relation is moved into a DM', async () => {
    const request = buildRequest({ objectName: 'agentChatThreadTarget' });
    const findAdmittedRecordIds = jest.fn(async () => new Set<string>());

    request.operationType = 'insert';
    request.records = [{ id: 'target-id', threadId: DIRECT_MESSAGE_ID }];
    request.context.findAdmittedRecordIds = findAdmittedRecordIds;

    expect(await findDirectMessageAdmittedRecordIds(request)).toEqual(
      new Set(),
    );
    expect(findAdmittedRecordIds).toHaveBeenCalledWith({
      objectUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      recordIds: [DIRECT_MESSAGE_ID],
      principal: request.principal,
      operationType: 'update',
    });
  });

  it('preserves ordinary chat creation', async () => {
    const request = buildRequest();

    request.operationType = 'insert';
    request.records = [{ id: REGULAR_THREAD_ID, ...regularThreadPair }];

    await expect(
      validateDirectMessageRecordsForWriteOrThrow(request),
    ).resolves.toBeUndefined();
  });

  it('rejects target insertion without DM write access', async () => {
    const request = buildRequest({ objectName: 'agentChatThreadTarget' });

    request.operationType = 'insert';
    request.records = [{ id: 'target-id', threadId: DIRECT_MESSAGE_ID }];
    request.context.findAdmittedRecordIds = async () => new Set();

    await expect(
      validateDirectMessageRecordsForWriteOrThrow(request),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
  });

  it('keeps a DM-to-ordinary-thread reparent event out of the outsider admitted set', async () => {
    const request = buildRequest({ objectName: 'agentChatThreadTarget' });

    request.records = resolveEventRecordAccessSnapshots([
      {
        recordId: 'target-id',
        properties: {
          before: { id: 'target-id', threadId: DIRECT_MESSAGE_ID },
          after: { id: 'target-id', threadId: REGULAR_THREAD_ID },
          updatedFields: ['threadId'],
          diff: {},
        },
      },
    ]);

    expect(
      await findDirectMessageAdmittedRecordIds({
        ...request,
        principal: {
          ...request.principal,
          mainPrincipal: {
            type: 'workspaceMember',
            roleId: ROLE_ID,
            workspaceMemberId: OUTSIDER_ID,
          },
        },
      }),
    ).toEqual(new Set());
    expect(await findDirectMessageAdmittedRecordIds(request)).toEqual(
      new Set(['target-id']),
    );
  });

  it('rejects changing the canonical member pair through generic updates', async () => {
    const request = buildRequest();

    request.operationType = 'update';
    request.records = [
      {
        id: DIRECT_MESSAGE_ID,
        ...directMessagePair,
        directMessageSecondWorkspaceMemberId: OUTSIDER_ID,
      },
    ];

    await expect(
      DIRECT_MESSAGE_ROW_ACCESS_POLICY.validateWritesOrThrow({
        ...request,
        recordsBefore: [{ id: DIRECT_MESSAGE_ID, ...directMessagePair }],
        targetRelations: [],
        findReadableRecordIds: async () => new Set(),
      }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
  });

  it('rejects a pair member moving DM history into an ordinary thread', async () => {
    const request = buildRequest({ objectName: 'agentChatThreadTarget' });

    request.operationType = 'update';
    request.records = [{ id: 'target-id', threadId: REGULAR_THREAD_ID }];

    await expect(
      DIRECT_MESSAGE_ROW_ACCESS_POLICY.validateWritesOrThrow({
        ...request,
        recordsBefore: [{ id: 'target-id', threadId: DIRECT_MESSAGE_ID }],
        targetRelations: [],
        findReadableRecordIds: async () => new Set(),
      }),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });
  });
});
