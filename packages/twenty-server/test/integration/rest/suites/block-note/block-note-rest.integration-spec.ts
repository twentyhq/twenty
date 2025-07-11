import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

describe('Block note REST api tests suite', () => {
  it('should create a block note record', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      bearer: '',
    })
  });
});
