import { WorkspaceResolverBuilderMethodNames } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { getResolverName } from 'src/workspace/utils/get-resolver-name.util';

describe('getResolverName', () => {
  const metadata = {
    nameSingular: 'entity',
    namePlural: 'entities',
  };

  it.each([
    ['findMany', 'entities'],
    ['findOne', 'entity'],
    ['createMany', 'createEntities'],
    ['createOne', 'createEntity'],
    ['updateOne', 'updateEntity'],
    ['deleteOne', 'deleteEntity'],
    ['executeQuickActionOnOne', 'executeQuickActionOnEntity'],
  ])('should return correct name for %s resolver', (type, expectedResult) => {
    expect(
      getResolverName(metadata, type as WorkspaceResolverBuilderMethodNames),
    ).toBe(expectedResult);
  });

  it('should throw an error for an unknown resolver type', () => {
    const unknownType = 'unknownType';

    expect(() =>
      getResolverName(
        metadata,
        unknownType as WorkspaceResolverBuilderMethodNames,
      ),
    ).toThrow(`Unknown resolver type: ${unknownType}`);
  });
});
