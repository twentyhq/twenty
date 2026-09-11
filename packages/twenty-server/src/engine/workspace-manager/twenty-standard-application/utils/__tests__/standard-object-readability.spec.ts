import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  MetadataReadability,
  MetadataWritability,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { resolveObjectAccessInheritance } from 'src/engine/twenty-orm/utils/resolve-object-access-inheritance.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

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

  const recordShareFlatObjectMetadata = standardFlatObjectMetadatas.find(
    (flatObjectMetadata) =>
      flatObjectMetadata.universalIdentifier ===
      STANDARD_OBJECTS.recordShare.universalIdentifier,
  );

  const inheritedStandardObjectNames = [
    'attachment',
    'timelineActivity',
    'noteTarget',
    'taskTarget',
    'messageThreadTarget',
    'calendarEventTarget',
  ];

  const inheritedStandardFlatObjectMetadatas =
    standardFlatObjectMetadatas.filter((flatObjectMetadata) =>
      inheritedStandardObjectNames.includes(flatObjectMetadata.nameSingular),
    );

  const otherStandardFlatObjectMetadatas = standardFlatObjectMetadatas.filter(
    (flatObjectMetadata) =>
      flatObjectMetadata.universalIdentifier !==
        STANDARD_OBJECTS.recordShare.universalIdentifier &&
      !inheritedStandardObjectNames.includes(flatObjectMetadata.nameSingular),
  );

  it('declares recordShare SYSTEM for readability and writability', () => {
    expect(recordShareFlatObjectMetadata).toMatchObject({
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
    });
  });

  it('declares the standard child objects INHERITED through their single access parent', () => {
    expect(inheritedStandardFlatObjectMetadatas).toHaveLength(
      inheritedStandardObjectNames.length,
    );

    for (const flatObjectMetadata of inheritedStandardFlatObjectMetadatas) {
      expect(flatObjectMetadata.readability).toBe(
        MetadataReadability.INHERITED,
      );
      expect(flatObjectMetadata.inheritance?.match).toBe(
        ObjectAccessInheritanceMatch.ANY,
      );
      expect(flatObjectMetadata.inheritance?.through).toHaveLength(1);
    }
  });

  it('resolves every inherited standard object to at least one MANY_TO_ONE parent', () => {
    for (const flatObjectMetadata of inheritedStandardFlatObjectMetadatas) {
      const resolution = resolveObjectAccessInheritance({
        flatObjectMetadata,
        flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
        flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
      });

      expect(resolution).toMatchObject({ status: 'resolved' });

      if (resolution.status !== 'resolved') {
        continue;
      }

      expect(resolution.branches).toHaveLength(1);
      expect(resolution.branches[0].columns.length).toBeGreaterThan(0);
    }
  });

  it('points attachment and timelineActivity at their target morph group', () => {
    const morphParents = ['attachment', 'timelineActivity'].map(
      (nameSingular) =>
        inheritedStandardFlatObjectMetadatas.find(
          (flatObjectMetadata) =>
            flatObjectMetadata.nameSingular === nameSingular,
        )?.inheritance?.through[0],
    );

    expect(morphParents).toEqual([
      {
        kind: ObjectAccessInheritanceRelationKind.MORPH,
        morphId: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
      },
      {
        kind: ObjectAccessInheritanceRelationKind.MORPH,
        morphId:
          STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      },
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
