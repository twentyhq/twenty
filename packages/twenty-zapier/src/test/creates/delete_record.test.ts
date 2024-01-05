import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';

import { createRecordKey } from '../../creates/create_record';
import { deleteRecordKey } from '../../creates/delete_record';
import App from '../../index';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
const appTester = createAppTester(App);

tools.env.inject();
describe('creates.delete_company', () => {
  test('should run to delete a Company record', async () => {
    const createBundle = getBundle({
      nameSingular: 'Company',
      name: 'Delete Company Name',
      employees: 25,
    });

    const createResult = await appTester(
      App.creates[createRecordKey].operation.perform,
      createBundle,
    );

    const companyId = createResult.data?.createCompany?.id;

    const deleteBundle = getBundle({
      nameSingular: 'Company',
      id: companyId,
    });

    const deleteResult = await appTester(
      App.creates[deleteRecordKey].operation.perform,
      deleteBundle,
    );

    expect(deleteResult).toBeDefined();
    expect(deleteResult.data?.deleteCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompanies {companies(filter: {id: {eq: "${companyId}"}}){edges{node{id}}}}`,
        ),
      deleteBundle,
    );
    expect(checkDbResult.data.companies.edges.length).toEqual(0);
  });
});
