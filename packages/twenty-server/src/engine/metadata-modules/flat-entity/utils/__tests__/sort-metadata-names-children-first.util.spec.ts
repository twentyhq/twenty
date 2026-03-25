import { sortMetadataNamesChildrenFirst } from 'src/engine/metadata-modules/flat-entity/utils/sort-metadata-names-children-first.util';

describe('sortMetadataNamesChildrenFirst', () => {
  it('should return metadata names sorted with children first (most manyToOne relations first)', () => {
    const result = sortMetadataNamesChildrenFirst();

    expect(result).toMatchSnapshot();
  });
});
