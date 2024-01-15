import { Bundle, createAppTester, tools, ZObject } from 'zapier-platform-core';

import { createRecordKey } from '../../creates/create_record';
import { updateRecordKey } from '../../creates/update_record';
import App from '../../index';
import getBundle from '../../utils/getBundle';
import requestDb from '../../utils/requestDb';
const appTester = createAppTester(App);

tools.env.inject();
describe('creates.update_company', () => {
  test('should run to update a Company record', async () => {
    const createBundle = getBundle({
      nameSingular: 'Company',
      name: 'Company Name',
      employees: 25,
    });

    const createResult = await appTester(
      App.creates[createRecordKey].operation.perform,
      createBundle,
    );

    const companyId = createResult.data?.createCompany?.id;

    const updateBundle = getBundle({
      nameSingular: 'Company',
      id: companyId,
      name: 'Updated Company Name',
    });

    const updateResult = await appTester(
      App.creates[updateRecordKey].operation.perform,
      updateBundle,
    );

    expect(updateResult).toBeDefined();
    expect(updateResult.data?.updateCompany?.id).toBeDefined();
    const checkDbResult = await appTester(
      (z: ZObject, bundle: Bundle) =>
        requestDb(
          z,
          bundle,
          `query findCompany {company(filter: {id: {eq: "${companyId}"}}){id name}}`,
        ),
      updateBundle,
    );
    expect(checkDbResult.data.company.name).toEqual('Updated Company Name');
  });
});
