import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const INHERITED_STANDARD_OBJECT_PARENT_FIELDS = {
  attachment: STANDARD_OBJECT_FIELDS.attachment.targetNote,
  timelineActivity: STANDARD_OBJECT_FIELDS.timelineActivity.targetPerson,
  note: STANDARD_OBJECT_FIELDS.note.noteTargets,
  noteTarget: STANDARD_OBJECT_FIELDS.noteTarget.targetPerson,
  task: STANDARD_OBJECT_FIELDS.task.taskTargets,
  taskTarget: STANDARD_OBJECT_FIELDS.taskTarget.targetPerson,
  messageThreadTarget: STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread,
  calendarEventTarget: STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent,
  agentChatThreadTarget: STANDARD_OBJECT_FIELDS.agentChatThreadTarget.thread,
} as const;

describe('Standard object readability', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const standardFlatObjectMetadatas = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const findStandardFlatObjectMetadata = (
    objectName: keyof typeof STANDARD_OBJECTS,
  ): FlatObjectMetadata | undefined =>
    standardFlatObjectMetadatas.find(
      (flatObjectMetadata) =>
        flatObjectMetadata.universalIdentifier ===
        STANDARD_OBJECTS[objectName].universalIdentifier,
    );

  const resolveParents = (objectName: keyof typeof STANDARD_OBJECTS) => {
    const flatObjectMetadata = findStandardFlatObjectMetadata(objectName);

    expect(flatObjectMetadata).toBeDefined();

    return resolveInheritedReadabilityParents({
      flatObjectMetadata: flatObjectMetadata!,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    });
  };

  const inheritedObjectNames = Object.keys(
    INHERITED_STANDARD_OBJECT_PARENT_FIELDS,
  ) as (keyof typeof INHERITED_STANDARD_OBJECT_PARENT_FIELDS)[];

  const nonOpenObjectUniversalIdentifiers: string[] = [
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    STANDARD_OBJECTS.agentMessage.universalIdentifier,
    STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
    STANDARD_OBJECTS.agentTurn.universalIdentifier,
    STANDARD_OBJECTS.agentTurnEvaluation.universalIdentifier,

    STANDARD_OBJECTS.campaignDelivery.universalIdentifier,
    STANDARD_OBJECTS.messageSuppression.universalIdentifier,

    STANDARD_OBJECTS.recordShare.universalIdentifier,
    ...inheritedObjectNames.map(
      (objectName) => STANDARD_OBJECTS[objectName].universalIdentifier,
    ),
  ];

  const otherStandardFlatObjectMetadatas = standardFlatObjectMetadatas.filter(
    (flatObjectMetadata) =>
      !nonOpenObjectUniversalIdentifiers.includes(
        flatObjectMetadata.universalIdentifier,
      ),
  );

  it('declares recordShare SYSTEM for readability and writability', () => {
    expect(findStandardFlatObjectMetadata('recordShare')).toMatchObject({
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
    });
  });

  // A link inheriting from its record, as noteTarget does, would tell everyone
  // who can read the record which private conversations are filed under it.
  it('resolves its thread as the only parent of an agentChatThreadTarget', () => {
    expect(
      resolveParents('agentChatThreadTarget').map((parent) =>
        parent.kind === 'column'
          ? {
              joinColumnName: parent.joinColumnName,
              parentNameSingular: parent.parentFlatObjectMetadata.nameSingular,
            }
          : parent.kind,
      ),
    ).toEqual([
      { joinColumnName: 'threadId', parentNameSingular: 'agentChatThread' },
    ]);
  });

  it.each(inheritedObjectNames)(
    'declares %s INHERITED from its parent field',
    (objectName) => {
      expect(findStandardFlatObjectMetadata(objectName)).toMatchObject({
        readability: MetadataReadability.INHERITED,
        readabilityParentFieldUniversalIdentifiers: [
          INHERITED_STANDARD_OBJECT_PARENT_FIELDS[objectName]
            .universalIdentifier,
        ],
      });
    },
  );

  it('resolves every attachment target as a parent of attachment', () => {
    const parentJoinColumnNames = resolveParents('attachment')
      .map((parent) => (parent.kind === 'column' ? parent.joinColumnName : ''))
      .sort();

    expect(parentJoinColumnNames).toEqual(
      [
        'targetCompanyId',
        'targetDashboardId',
        'targetNoteId',
        'targetOpportunityId',
        'targetPersonId',
        'targetTaskId',
        'targetWorkflowId',
      ].sort(),
    );
  });

  it('resolves every target of a noteTarget as its parent, not the note', () => {
    const parents = resolveParents('noteTarget').map((parent) =>
      parent.kind === 'column'
        ? {
            joinColumnName: parent.joinColumnName,
            parentNameSingular: parent.parentFlatObjectMetadata.nameSingular,
          }
        : parent.kind,
    );

    expect(parents).toEqual(
      expect.arrayContaining([
        { joinColumnName: 'targetPersonId', parentNameSingular: 'person' },
        { joinColumnName: 'targetCompanyId', parentNameSingular: 'company' },
        {
          joinColumnName: 'targetOpportunityId',
          parentNameSingular: 'opportunity',
        },
      ]),
    );
    expect(parents).not.toContainEqual({
      joinColumnName: 'noteId',
      parentNameSingular: 'note',
    });
  });

  it('resolves its note targets as the parents of a note, through the noteId column', () => {
    expect(
      resolveParents('note').map((parent) =>
        parent.kind === 'children'
          ? {
              childNameSingular: parent.childFlatObjectMetadata.nameSingular,
              childJoinColumnName: parent.childJoinColumnName,
            }
          : parent.kind,
      ),
    ).toEqual([
      { childNameSingular: 'noteTarget', childJoinColumnName: 'noteId' },
    ]);
  });

  it('resolves its task targets as the parents of a task, through the taskId column', () => {
    expect(
      resolveParents('task').map((parent) =>
        parent.kind === 'children'
          ? {
              childNameSingular: parent.childFlatObjectMetadata.nameSingular,
              childJoinColumnName: parent.childJoinColumnName,
            }
          : parent.kind,
      ),
    ).toEqual([
      { childNameSingular: 'taskTarget', childJoinColumnName: 'taskId' },
    ]);
  });

  it('leaves every other standard object OPEN for readability', () => {
    const readabilities = new Set(
      otherStandardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.readability,
      ),
    );

    expect(otherStandardFlatObjectMetadatas.length).toBeGreaterThan(0);
    expect([...readabilities]).toEqual([MetadataReadability.OPEN]);
  });
});
