import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

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
    ['restoreMany', 'restoreEntities'],
    ['destroyMany', 'destroyEntities'],
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
