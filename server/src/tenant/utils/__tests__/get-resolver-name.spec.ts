import { ResolverBuilderMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';

import { getResolverName } from 'src/tenant/utils/get-resolver-name.util';

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
  ])('should return correct name for %s resolver', (type, expectedResult) => {
    expect(getResolverName(metadata, type as ResolverBuilderMethodNames)).toBe(
      expectedResult,
    );
  });

  it('should throw an error for an unknown resolver type', () => {
    const unknownType = 'unknownType';
    expect(() =>
      getResolverName(metadata, unknownType as ResolverBuilderMethodNames),
    ).toThrow(`Unknown resolver type: ${unknownType}`);
  });
});
