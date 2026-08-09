import { paginateMetadataOrderedItems } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata.util';

const items = ['first', 'second', 'third', 'fourth'].map((id) => ({ id }));

describe('paginateMetadataOrderedItems', () => {
  it('preserves domain order while paging forward', () => {
    const page = paginateMetadataOrderedItems({
      items,
      pagination: {
        limit: 2,
        direction: 'forward',
        afterId: 'first',
      },
    });

    expect(page).toEqual({
      items: [{ id: 'second' }, { id: 'third' }],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'second',
        endCursor: 'third',
      },
    });
  });

  it('returns the preceding window in domain order', () => {
    const page = paginateMetadataOrderedItems({
      items,
      pagination: {
        limit: 2,
        direction: 'backward',
        beforeId: 'fourth',
      },
    });

    expect(page).toEqual({
      items: [{ id: 'second' }, { id: 'third' }],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'second',
        endCursor: 'third',
      },
    });
  });

  it('does not reinterpret an unknown identity cursor as the first page', () => {
    const page = paginateMetadataOrderedItems({
      items,
      pagination: {
        limit: 2,
        direction: 'forward',
        afterId: 'missing',
      },
    });

    expect(page.items).toEqual([]);
    expect(page.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });
});
