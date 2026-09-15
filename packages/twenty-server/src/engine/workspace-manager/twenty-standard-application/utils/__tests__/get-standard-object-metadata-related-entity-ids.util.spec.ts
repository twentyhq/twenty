import { v4 } from 'uuid';

import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

jest.mock('uuid', () => ({
  ...jest.requireActual('uuid'),
  v4: jest.fn(),
}));

describe('getStandardObjectMetadataRelatedEntityIds', () => {
  let uuidCounter = 0;

  beforeEach(() => {
    uuidCounter = 0;
    (v4 as jest.Mock).mockImplementation(
      () =>
        `00000000-0000-0000-0000-${String(++uuidCounter).padStart(12, '0')}`,
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return standard object metadata related entity ids', () => {
    const result = getStandardObjectMetadataRelatedEntityIds();

    expect(result).toMatchSnapshot();
  });
});
