import {createAppTester} from "zapier-platform-core";
import App from "../../index";
import getBundle from "../../utils/getBundle";
const appTester = createAppTester(App);

describe('triggers.company', ()=> {
  test('should load company from hook', async ()=> {
    const bundle = {
      cleanedRequest: {
        id: 'd6ccb1d1-a90b-4822-a992-a0dd946592c9',
        name: '',
        domainName: '',
        createdAt: '2023-10-19 10:10:12.490',
        address: '',
        employees: null,
        linkedinUrl: null,
        xUrl: null,
        annualRecurringRevenue: null,
        idealCustomerProfile: false,
      }
    };
    const results = await appTester(App.triggers.company.operation.perform, bundle);
    expect(results.length).toEqual(1);
    const company = results[0];
    expect(company.id).toEqual('d6ccb1d1-a90b-4822-a992-a0dd946592c9')
  })
  it('should load companies from list', async () => {
    const bundle = getBundle({})
    const results = await appTester(App.triggers.company.operation.performList, bundle)
    expect(results.length).toBeGreaterThan(1)
    const firstCompany = results[0];
    expect(firstCompany.id).toBeDefined();
  });
})
