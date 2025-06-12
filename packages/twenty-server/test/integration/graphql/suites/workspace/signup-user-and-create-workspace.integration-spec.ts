import { faker } from '@faker-js/faker/.';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { performSignUp } from 'test/integration/graphql/utils/sign-up-operation.util';

type CreateObjectInputPayload = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
>;

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
