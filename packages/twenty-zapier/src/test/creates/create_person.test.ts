import App from '../../index';
import { createAppTester, tools } from 'zapier-platform-core';
const appTester = createAppTester(App);
tools.env.inject();

describe('creates.create_person', () => {
  test('should run', async () => {
    const bundle = {
      authData: { apiKey: String(process.env.API_KEY) },
      inputData: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
        phone: '+33610203040',
        city: 'Paris',
      },
    };
    const results = await appTester(
      App.creates.create_person.operation.perform,
      bundle,
    );
    expect(results).toBeDefined();
    expect(results.data?.createOnePerson?.id).toBeDefined();
  });
});
