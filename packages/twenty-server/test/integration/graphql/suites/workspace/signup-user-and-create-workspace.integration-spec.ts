import { faker } from '@faker-js/faker/.';
import { performSignUp } from 'test/integration/graphql/utils/sign-up-operation.util';

describe('Workspace tests suite', () => {
  it('should activate workspace', async () => {
    const tmp = await performSignUp({
      email: faker.internet.email(),
      password: faker.internet.password(),
    });
    console.log(tmp.body);
    // const response = await performActivateWorkspace({
    //   displayName: 'Acme',
    // });

    // console.log(response.body);
  });
});
