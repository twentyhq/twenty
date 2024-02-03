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
      'address',
      'employees',
    ])
    .orIgnore()
    .values([
      {
        name: 'ارتباطات هدی ارقام',
        domainName: 'hodaargham.com',
        address: 'کرج',
        employees: 5000,
      },
      {
        name: 'رسانه مهر',
        domainName: 'mehrfcp.ir',
        address: 'تهران',
        employees: 800,
      },
      {
        name: 'ضحی کیش',
        domainName: 'zohakish.ir',
        address: 'تهران',
        employees: 8000,
      },
      {
        name: 'راهپویان همتا',
        domainName: 'hamrahvas.com',
        address: 'مشهد',
        employees: 800,
      },
      {
        name: 'تالیا',
        domainName: 'taliya.ir',
        address: 'اصفهان',
        employees: 400,
      },
    ])
    .returning('*')
    .execute();
};
