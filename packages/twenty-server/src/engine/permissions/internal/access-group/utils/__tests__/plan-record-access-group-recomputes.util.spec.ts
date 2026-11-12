import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { planRecordAccessGroupRecomputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-recomputes.util';

const buildPath = ({
  source,
  target,
  isInherent = false,
}: {
  source: string;
  target: string;
  isInherent?: boolean;
}) => ({
  isInherent,
  sourceFlatObjectMetadata: getFlatObjectMetadataMock({
    id: source,
    universalIdentifier: source,
  }),
  targetObjectMetadataId: target,
});

const plan = ({
  objectMetadataIds,
  paths,
  objectsWithoutAccessGroups = [],
}: {
  objectMetadataIds: string[];
  paths: ReturnType<typeof buildPath>[];
  objectsWithoutAccessGroups?: string[];
}) =>
  planRecordAccessGroupRecomputes({
    objectMetadataIds,
    resolvedRelatedRecordPaths: paths,
    isObjectUsingRecordAccessGroups: (objectMetadataId) =>
      !objectsWithoutAccessGroups.includes(objectMetadataId),
  });

describe('planRecordAccessGroupRecomputes', () => {
  it('should plan only the changed objects when no path leads from them', () => {
    expect(plan({ objectMetadataIds: ['company'], paths: [] })).toEqual([
      { objectMetadataId: 'company', propagatedFromObjectMetadataIds: [] },
    ]);
  });

  it('should plan the objects a changed object leads to', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [buildPath({ source: 'company', target: 'person' })],
      }),
    ).toEqual([
      { objectMetadataId: 'company', propagatedFromObjectMetadataIds: [] },
      {
        objectMetadataId: 'person',
        propagatedFromObjectMetadataIds: ['company'],
      },
    ]);
  });

  it('should only keep following inherent paths past the first object', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [
          buildPath({ source: 'company', target: 'person' }),
          buildPath({ source: 'person', target: 'note' }),
          buildPath({ source: 'person', target: 'task', isInherent: true }),
        ],
      }).map(({ objectMetadataId }) => objectMetadataId),
    ).toEqual(['company', 'person', 'task']);
  });

  it('should skip objects that do not use access groups', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [buildPath({ source: 'company', target: 'person' })],
        objectsWithoutAccessGroups: ['person'],
      }).map(({ objectMetadataId }) => objectMetadataId),
    ).toEqual(['company']);
  });

  it('should plan an object once per kind of recompute and stop on cycles', () => {
    expect(
      plan({
        objectMetadataIds: ['company', 'person'],
        paths: [
          buildPath({ source: 'company', target: 'person', isInherent: true }),
          buildPath({ source: 'person', target: 'company', isInherent: true }),
        ],
      }),
    ).toEqual([
      { objectMetadataId: 'company', propagatedFromObjectMetadataIds: [] },
      { objectMetadataId: 'person', propagatedFromObjectMetadataIds: [] },
      {
        objectMetadataId: 'person',
        propagatedFromObjectMetadataIds: ['company'],
      },
      {
        objectMetadataId: 'company',
        propagatedFromObjectMetadataIds: ['person'],
      },
    ]);
  });
});
