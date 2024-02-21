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
      'position',
    ])
    .orIgnore()
    .values([
      {
        name: 'ارتباطات هدی ارقام',
        domainName: 'hodaargham.com',
        address: 'کرج',
        employees: 5000,
        position: 1,
      },
      {
        name: 'رسانه مهر',
        domainName: 'mehrfcp.ir',
        address: 'تهران',
        employees: 800,
        position: 2,
      },
      {
        name: 'ضحی کیش',
        domainName: 'zohakish.ir',
        address: 'تهران',
        employees: 8000,
        position: 3,
      },
      {
        name: 'راهپویان همتا',
        domainName: 'hamrahvas.com',
        address: 'مشهد',
        employees: 800,
        position: 4,
      },
      {
        name: 'تالیا',
        domainName: 'taliya.ir',
        address: 'اصفهان',
        employees: 400,
        position: 5,
      },
    ])
    .returning('*')
    .execute();
};
