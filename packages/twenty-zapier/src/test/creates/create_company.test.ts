import App from '../../index';
import { createAppTester, tools } from 'zapier-platform-core';
import {log} from "util";
const appTester = createAppTester(App);
tools.env.inject;

describe('creates.create_company', () => {
  test('should run', async () => {
    const bundle = {
      authData: { apiKey: String(process.env.API_KEY) },
      inputData: {
        name: 'Company Name',
        address: 'Company Address',
        domainName: 'Company Domain Name',
        linkedinUrl: "Test linkedinUrl",
        xUrl: "Test xUrl",
        annualRecurringRevenue: 100000,
        idealCustomerProfile: true,
        employees: 25
      },
    };
    const result = await appTester(
      App.creates.create_company.operation.perform,
      bundle,
    );
    expect(result).toBeDefined();
    expect(result.data?.createOneCompany?.id).toBeDefined();
  });
});
