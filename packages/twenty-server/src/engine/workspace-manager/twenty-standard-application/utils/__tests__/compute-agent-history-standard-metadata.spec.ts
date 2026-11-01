import { validateAndReturnIndexWhereClause } from 'src/engine/workspace-manager/workspace-migration/utils/validate-index-where-clause.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isDefined } from 'twenty-shared/utils';
import { validateMorphOrRelationFlatFieldOnDelete } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-on-delete.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const OBJECT_NAMES = [
  'agentChatThread',
  'agentChatThreadTarget',
  'agentChatThreadParticipant',
  'agentMessage',
  'agentMessagePart',
  'agentMessageReaction',
  'agentTurn',
] as const;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-20T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

describe('agent history workspace metadata', () => {
  it.each(OBJECT_NAMES)(
    'materializes exactly the declared fields for %s',
    (name) => {
      const fields = Object.values(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (field) =>
            field.objectMetadataUniversalIdentifier ===
            STANDARD_OBJECTS[name].universalIdentifier,
        );
      expect(fields.map((field) => field.name).sort()).toEqual(
        Object.keys(STANDARD_OBJECTS[name].fields).sort(),
      );
    },
  );

  it('uses index predicates accepted by the workspace schema manager', () => {
    for (const index of Object.values(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      expect(() =>
        validateAndReturnIndexWhereClause(index.indexWhereClause),
      ).not.toThrow();
    }
  });
  it('passes relation delete-action validation', () => {
    const historyObjectIds: string[] = OBJECT_NAMES.map(
      (name) => STANDARD_OBJECTS[name].universalIdentifier,
    );
    for (const field of Object.values(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (
        !isMorphOrRelationFlatFieldMetadata(field) ||
        !historyObjectIds.includes(field.objectMetadataUniversalIdentifier)
      )
        continue;
      expect(
        validateMorphOrRelationFlatFieldOnDelete({
          universalFlatFieldMetadata: {
            ...field,
            universalSettings: field.settings,
          },
        }),
      ).toEqual([]);
    }
  });

  it.each(['agentMessage', 'agentTurn'] as const)(
    'indexes %s by agent',
    (name) => {
      expect(
        allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
          STANDARD_OBJECTS[name].indexes.agentIndex.universalIdentifier
        ],
      ).toMatchObject({ isUnique: false });
    },
  );
  it.each(OBJECT_NAMES)('keeps %s protected by metadata policy', (name) => {
    expect(
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[name].universalIdentifier
      ],
    ).toMatchObject({
      nameSingular: name,
      isSystem: true,
      isSearchable: false,
      isAuditLogged: false,
      isUICreatable: false,
      // Chats can be renamed from their record page
      isUIEditable: name === 'agentChatThread',
    });
  });

  it('presents conversations as chats identified by an editable title', () => {
    const chatObject =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];
    const titleField =
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier
      ];

    expect(chatObject).toMatchObject({
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      labelIdentifierFieldMetadataUniversalIdentifier:
        STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier,
    });
    expect(titleField).toMatchObject({ isUIEditable: true });
  });

  it('keeps conversation identity system-managed and existing chats regular', () => {
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.conversationType
          .universalIdentifier
      ],
    ).toMatchObject({
      type: FieldMetadataType.SELECT,
      isSystem: true,
      isUIEditable: false,
      isNullable: false,
      defaultValue: "'STANDARD'",
      disabledFieldPermissionActions: ['canUpdateFieldValue'],
      options: [{ value: 'STANDARD' }, { value: 'DIRECT_MESSAGE' }],
    });
  });

  it('retains messages when a sender member is deleted', () => {
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentMessage.fields.senderWorkspaceMember
          .universalIdentifier
      ],
    ).toMatchObject({
      isNullable: true,
      settings: {
        onDelete: 'SET_NULL',
        joinColumnName: 'senderWorkspaceMemberId',
      },
    });
  });

  it('removes reactions with their message or their member, one per member and emoji', () => {
    const { fields, indexes } = STANDARD_OBJECTS.agentMessageReaction;

    for (const [field, joinColumnName, isNullable] of [
      [fields.message, 'messageId', false],
      [fields.workspaceMember, 'workspaceMemberId', true],
    ] as const) {
      expect(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          field.universalIdentifier
        ],
      ).toMatchObject({
        isNullable,
        settings: { onDelete: 'CASCADE', joinColumnName },
      });
    }
    expect(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        indexes.messageWorkspaceMemberEmojiUniqueIndex.universalIdentifier
      ],
    ).toMatchObject({
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
      universalFlatIndexFieldMetadatas: [
        {
          fieldMetadataUniversalIdentifier: fields.message.universalIdentifier,
        },
        {
          fieldMetadataUniversalIdentifier:
            fields.workspaceMember.universalIdentifier,
        },
        { fieldMetadataUniversalIdentifier: fields.emoji.universalIdentifier },
      ],
    });
  });

  it('lets an agent react without a workspace member', () => {
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentMessageReaction.fields.agentId.universalIdentifier
      ],
    ).toMatchObject({
      name: 'agentId',
      type: FieldMetadataType.UUID,
      isSystem: true,
      isNullable: true,
    });
  });

  it('retains exact precision for credits and cache token counts', () => {
    for (const name of [
      'totalInputCredits',
      'totalOutputCredits',
      'totalCacheReadTokens',
      'totalCacheCreationTokens',
    ] as const) {
      expect(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.fields[name].universalIdentifier
        ],
      ).toMatchObject({ type: FieldMetadataType.NUMERIC, defaultValue: "'0'" });
    }
  });
});
