import { EntityManager } from 'typeorm';

export const companyPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.company`, [
      'name',
      'domainName',
      'addressAddressStreet1',
      'addressAddressStreet2',
      'addressAddressCity',
      'addressAddressState',
      'addressAddressPostcode',
      'addressAddressCountry',
      'employees',
      'position',
    ])
    .orIgnore()
    .values([
      {
        name: 'Airbnb',
        domainName: 'airbnb.com',
        addressAddressStreet1: '888 Brannan St',
        addressAddressStreet2: null,
        addressAddressCity: 'San Francisco',
        addressAddressState: 'CA',
        addressAddressPostcode: '94103',
        addressAddressCountry: 'United States',
        employees: 5000,
        position: 1,
      },
      {
        name: 'Qonto',
        domainName: 'qonto.com',
        addressAddressStreet1: '18 rue de navarrin',
        addressAddressStreet2: null,
        addressAddressCity: 'Paris',
        addressAddressState: null,
        addressAddressPostcode: '75009',
        addressAddressCountry: 'France',
        employees: 800,
        position: 2,
      },
      {
        name: 'Stripe',
        domainName: 'stripe.com',
        addressAddressStreet1: 'Eutaw Street',
        addressAddressStreet2: null,
        addressAddressCity: 'Dublin',
        addressAddressState: null,
        addressAddressPostcode: null,
        addressAddressCountry: 'Ireland',
        employees: 8000,
        position: 3,
      },
      {
        name: 'Figma',
        domainName: 'figma.com',
        addressAddressStreet1: '760 Market St',
        addressAddressStreet2: 'Floor 10',
        addressAddressCity: 'San Francisco',
        addressAddressState: null,
        addressAddressPostcode: '94102',
        addressAddressCountry: 'United States',
        employees: 800,
        position: 4,
      },
      {
        name: 'Notion',
        domainName: 'notion.com',
        addressAddressStreet1: '2300 Harrison St',
        addressAddressStreet2: null,
        addressAddressCity: 'San Francisco',
        addressAddressState: 'CA',
        addressAddressPostcode: '94110',
        addressAddressCountry: 'United States',
        employees: 400,
        position: 5,
      },
    ])
    .returning('*')
    .execute();
};
