import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const INHERITED_STANDARD_OBJECT_PARENT_FIELDS = {
  attachment: STANDARD_OBJECT_FIELDS.attachment.targetNote,
  timelineActivity: STANDARD_OBJECT_FIELDS.timelineActivity.targetPerson,
  noteTarget: STANDARD_OBJECT_FIELDS.noteTarget.note,
  taskTarget: STANDARD_OBJECT_FIELDS.taskTarget.task,
  messageThreadTarget: STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread,
  calendarEventTarget: STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent,
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

  const inheritedObjectNames = Object.keys(
    INHERITED_STANDARD_OBJECT_PARENT_FIELDS,
  ) as (keyof typeof INHERITED_STANDARD_OBJECT_PARENT_FIELDS)[];

  const privateObjectNames = [
    'callRecording',
    'message',
    'messageThread',
    'calendarEvent',
  ] as const satisfies (keyof typeof STANDARD_OBJECTS)[];

  const nonOpenObjectUniversalIdentifiers: string[] = [
    STANDARD_OBJECTS.recordShare.universalIdentifier,
    ...privateObjectNames.map(
      (objectName) => STANDARD_OBJECTS[objectName].universalIdentifier,
    ),
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

  it.each(privateObjectNames)(
    'declares %s PRIVATE for readability and OPEN for writability',
    (objectName) => {
      expect(findStandardFlatObjectMetadata(objectName)).toMatchObject({
        readability: MetadataReadability.PRIVATE,
        writability: MetadataWritability.OPEN,
      });
    },
  );

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
    const attachmentFlatObjectMetadata =
      findStandardFlatObjectMetadata('attachment');

    expect(attachmentFlatObjectMetadata).toBeDefined();

    const parentJoinColumnNames = resolveInheritedReadabilityParents({
      flatObjectMetadata: attachmentFlatObjectMetadata!,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    })
      .map(({ joinColumnName }) => joinColumnName)
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

  it('resolves the note as the only parent of noteTarget', () => {
    const noteTargetFlatObjectMetadata =
      findStandardFlatObjectMetadata('noteTarget');

    expect(noteTargetFlatObjectMetadata).toBeDefined();

    expect(
      resolveInheritedReadabilityParents({
        flatObjectMetadata: noteTargetFlatObjectMetadata!,
        flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
        flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
      }).map(({ joinColumnName, parentFlatObjectMetadata }) => ({
        joinColumnName,
        parentNameSingular: parentFlatObjectMetadata.nameSingular,
      })),
    ).toEqual([{ joinColumnName: 'noteId', parentNameSingular: 'note' }]);
  });

  it('leaves every other standard object OPEN', () => {
    const readabilities = new Set(
      otherStandardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.readability,
      ),
    );
    const writabilities = new Set(
      otherStandardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.writability,
      ),
    );

    expect(otherStandardFlatObjectMetadatas.length).toBeGreaterThan(0);
    expect([...readabilities]).toEqual([MetadataReadability.OPEN]);
    expect([...writabilities]).toEqual([MetadataWritability.OPEN]);
  });
});
