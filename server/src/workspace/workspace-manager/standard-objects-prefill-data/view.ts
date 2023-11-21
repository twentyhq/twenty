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
        name: 'All Companies',
        objectMetadataId: objectMetadataMap['company'].id,
        type: 'table',
      },
      {
        name: 'All People',
        objectMetadataId: objectMetadataMap['person'].id,
        type: 'table',
      },
      {
        name: 'All Opportunities',
        objectMetadataId: objectMetadataMap['company'].id,
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
      // Company
      {
        fieldMetadataId: objectMetadataMap['company'].fields['name'],
        viewId: viewIdMap['All Companies'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['domainName'],
        viewId: viewIdMap['All Companies'],
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['employees'],
        viewId: viewIdMap['All Companies'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['linkedinLink'],
        viewId: viewIdMap['All Companies'],
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['address'],
        viewId: viewIdMap['All Companies'],
        position: 6,
        isVisible: true,
        size: 170,
      },
      // Person
      {
        fieldMetadataId: objectMetadataMap['person'].fields['firstName'], // TODO: change to displayName once we have name field type
        viewId: viewIdMap['All People'],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['email'],
        viewId: viewIdMap['All People'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['phone'],
        viewId: viewIdMap['All People'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['city'],
        viewId: viewIdMap['All People'],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['jobTitle'],
        viewId: viewIdMap['All People'],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['linkedinLink'],
        viewId: viewIdMap['All People'],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['xLink'],
        viewId: viewIdMap['All People'],
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
      // Opportunity
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
