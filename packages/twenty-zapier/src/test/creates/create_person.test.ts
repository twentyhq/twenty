import App from '../../index';
import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
const appTester = createAppTester(App);
tools.env.inject();

describe('creates.create_person', () => {
  test('should run', async () => {
    const bundle = getBundle({
      name: {firstName: 'John', lastName: 'Doe'},
      email: 'johndoe@gmail.com',
      phone: '+33610203040',
      city: 'Paris',
    });
    const results = await appTester(
      App.creates.create_person.operation.perform,
      bundle,
    );
    expect(results).toBeDefined();
    expect(results.data?.createPerson?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findPerson {person(filter: {id: {eq: "${results.data.createPerson.id}"}}){phone}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.person.phone).toEqual('+33610203040');
  });

  test('should run with not required missing params', async () => {
    const bundle = getBundle({
      name: {firstName: 'John', lastName: 'Doe'},
      email: 'johndoe@gmail.com',
      city: 'Paris',
    });
    const results = await appTester(
      App.creates.create_person.operation.perform,
      bundle,
    );
    expect(results).toBeDefined();
    expect(results.data?.createPerson?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findPerson {person(filter: {id: {eq: "${results.data.createPerson.id}"}}){phone}}`,
        ),
      bundle,
    );
    expect(checkDbResult.data.person.phone).toEqual("");
  });
});
