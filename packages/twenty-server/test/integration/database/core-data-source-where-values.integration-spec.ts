import { type DataSource } from 'typeorm';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

describe('Core data source where values', () => {
  it('should refuse to find with an undefined where value instead of returning the first row', async () => {
    const userWorkspaceRepository = getAppProviderByClassName<DataSource>(
      'DataSource',
    ).getRepository('UserWorkspaceEntity');

    await expect(
      userWorkspaceRepository.findOne({ where: { id: undefined } }),
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
