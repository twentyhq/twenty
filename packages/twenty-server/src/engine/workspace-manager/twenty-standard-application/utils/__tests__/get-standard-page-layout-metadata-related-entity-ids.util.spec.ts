import { v4 as uuidv4 } from 'uuid';

import { getStandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

jest.mock('uuid');

beforeEach(() => {
  let counter = 0;

  (uuidv4 as jest.Mock).mockImplementation(
    () => `00000000-0000-0000-0000-${String(++counter).padStart(12, '0')}`,
  );
});

afterAll(() => {
  jest.resetAllMocks();
});

describe('getStandardPageLayoutMetadataRelatedEntityIds', () => {
  it('should return standard page layout metadata related entity ids', () => {
    const result = getStandardPageLayoutMetadataRelatedEntityIds();

    expect(result).toMatchSnapshot();
  });
});
