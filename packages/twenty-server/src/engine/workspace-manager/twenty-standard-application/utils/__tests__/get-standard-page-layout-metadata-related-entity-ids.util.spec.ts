let uuidCounter = 0;

jest.mock('uuid', () => ({
  v4: jest.fn(
    () => `00000000-0000-0000-0000-${String(++uuidCounter).padStart(12, '0')}`,
  ),
}));

import { getStandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

describe('getStandardPageLayoutMetadataRelatedEntityIds', () => {
  beforeEach(() => {
    uuidCounter = 0;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return standard page layout metadata related entity ids', () => {
    const result = getStandardPageLayoutMetadataRelatedEntityIds();

    expect(result).toMatchSnapshot();
  });
});
