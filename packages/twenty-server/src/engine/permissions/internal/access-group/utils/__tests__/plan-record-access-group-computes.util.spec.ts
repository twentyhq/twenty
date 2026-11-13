import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';

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
  planRecordAccessGroupComputes({
    objectMetadataIds,
    resolvedRelatedRecordPaths: paths,
    isObjectUsingRecordAccessGroups: (objectMetadataId) =>
      !objectsWithoutAccessGroups.includes(objectMetadataId),
  });

describe('planRecordAccessGroupComputes', () => {
  it('should plan only the changed objects when no path leads from them', () => {
    expect(plan({ objectMetadataIds: ['company'], paths: [] })).toEqual([
      'company',
    ]);
  });

  it('should plan the objects a changed object leads to after it', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [buildPath({ source: 'company', target: 'person' })],
      }),
    ).toEqual(['company', 'person']);
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
      }),
    ).toEqual(['company', 'person', 'task']);
  });

  it('should skip objects that do not use access groups', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [buildPath({ source: 'company', target: 'person' })],
        objectsWithoutAccessGroups: ['person'],
      }),
    ).toEqual(['company']);
  });

  it('should plan an object again after an object it reads, and stop on cycles', () => {
    expect(
      plan({
        objectMetadataIds: ['company', 'person'],
        paths: [
          buildPath({ source: 'company', target: 'person', isInherent: true }),
          buildPath({ source: 'person', target: 'company', isInherent: true }),
        ],
      }),
    ).toEqual(['company', 'person', 'company']);
  });

  it('should plan an object after every object leading to it', () => {
    expect(
      plan({
        objectMetadataIds: ['company'],
        paths: [
          buildPath({ source: 'company', target: 'task' }),
          buildPath({ source: 'company', target: 'person' }),
          buildPath({ source: 'person', target: 'task', isInherent: true }),
        ],
      }),
    ).toEqual(['company', 'task', 'person', 'task']);
  });
});
