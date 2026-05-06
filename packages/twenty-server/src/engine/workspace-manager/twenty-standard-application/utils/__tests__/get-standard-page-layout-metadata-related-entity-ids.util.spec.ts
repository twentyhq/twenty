import { v4 } from 'uuid';

import { getStandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('getStandardPageLayoutMetadataRelatedEntityIds', () => {
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

  it('should return standard page layout metadata related entity ids', () => {
    const result = getStandardPageLayoutMetadataRelatedEntityIds();

    expect(result).toMatchSnapshot();
  });
});
