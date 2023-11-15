import { EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const viewPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  // Creating views
  const createdViews = await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, ['name', 'objectMetadataId', 'type'])
    .orIgnore()
    .values([
      {
        name: 'All companies',
        objectMetadataId: 'company',
        type: 'table',
      },
      {
        name: 'All people',
        objectMetadataId: 'person',
        type: 'table',
      },
      {
        name: 'All opportunities',
        objectMetadataId: 'company',
        type: 'kanban',
      },
      {
        name: 'All Companies (V2)',
        objectMetadataId: objectMetadataMap['companyV2'].id,
        type: 'table',
      },
      {
        name: 'All People (V2)',
        objectMetadataId: objectMetadataMap['personV2'].id,
        type: 'table',
      },
      {
        name: 'All Opportunities (V2)',
        objectMetadataId: objectMetadataMap['companyV2'].id,
        type: 'kanban',
      },
    ])
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[view.name] = view.id;
    return acc;
  }, {});

  // Creating viewFields
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.viewField`, [
      'fieldMetadataId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .orIgnore()
    .values([
      // CompanyV2
      {
        fieldMetadataId: objectMetadataMap['companyV2'].fields['name'],
        viewId: viewIdMap['All Companies (V2)'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: objectMetadataMap['companyV2'].fields['domainName'],
        viewId: viewIdMap['All Companies (V2)'],
        position: 1,
        isVisible: true,
        size: 100,
      },
      // {
      //   fieldMetadataId: objectMetadataMap['companyV2'].fields['accountOwner'],
      //   viewId: viewIdMap['All Companies (V2)'],
      //   position: 2,
      //   isVisible: true,
      //   size: 150,
      // },
      // {
      //   fieldMetadataId: 'createdAt',
      //   viewId: viewIdMap['All Companies (V2)'],
      //   position: 3,
      //   isVisible: true,
      //   size: 150,
      // },
      {
        fieldMetadataId: objectMetadataMap['companyV2'].fields['employees'],
        viewId: viewIdMap['All Companies (V2)'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['companyV2'].fields['linkedinUrl'],
        viewId: viewIdMap['All Companies (V2)'],
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: objectMetadataMap['companyV2'].fields['address'],
        viewId: viewIdMap['All Companies (V2)'],
        position: 6,
        isVisible: true,
        size: 170,
      },
      // PeopleV2
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['firstName'], // TODO: change to displayName once we have name field type
        viewId: viewIdMap['All People (V2)'],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['email'],
        viewId: viewIdMap['All People (V2)'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      // {
      //   fieldMetadataId: objectMetadataMap['personV2'].fields['company'],
      //   viewId: viewIdMap['All People (V2)'],
      //   position: 2,
      //   isVisible: true,
      //   size: 150,
      // },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['phone'],
        viewId: viewIdMap['All People (V2)'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      // {
      //   fieldMetadataId: 'createdAt',
      //   viewId: viewIdMap['All People (V2)'],
      //   position: 4,
      //   isVisible: true,
      //   size: 150,
      // },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['city'],
        viewId: viewIdMap['All People (V2)'],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['jobTitle'],
        viewId: viewIdMap['All People (V2)'],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['linkedinUrl'],
        viewId: viewIdMap['All People (V2)'],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['personV2'].fields['xUrl'],
        viewId: viewIdMap['All People (V2)'],
        position: 8,
        isVisible: true,
        size: 150,
      },
      // Companies
      {
        fieldMetadataId: 'name',
        viewId: viewIdMap['All companies'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: 'domainName',
        viewId: viewIdMap['All companies'],
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: 'accountOwner',
        viewId: viewIdMap['All companies'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: viewIdMap['All companies'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'employees',
        viewId: viewIdMap['All companies'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'linkedin',
        viewId: viewIdMap['All companies'],
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: 'address',
        viewId: viewIdMap['All companies'],
        position: 6,
        isVisible: true,
        size: 170,
      },
      // Opportunities
      {
        fieldMetadataId: 'amount',
        viewId: viewIdMap['All opportunities'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: 'probability',
        viewId: viewIdMap['All opportunities'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'closeDate',
        viewId: viewIdMap['All opportunities'],
        position: 2,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: 'company',
        viewId: viewIdMap['All opportunities'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'createdAt',
        viewId: viewIdMap['All opportunities'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: 'pointOfContact',
        viewId: viewIdMap['All opportunities'],
        position: 5,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
