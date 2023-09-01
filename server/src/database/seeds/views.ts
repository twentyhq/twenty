import { PrismaClient } from '@prisma/client';

export const seedViews = async (prisma: PrismaClient) => {
  const workspaceId = 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419';
  const companyViewId = 'twenty-5e924b69-a619-41bf-bd31-a9e8551fc9d1';
  const personViewId = 'twenty-db9e6c85-c091-4fd6-88b1-c1830f5e90d1';

  await prisma.view.upsert({
    where: { id: companyViewId },
    update: {},
    create: {
      id: companyViewId,
      name: 'All Companies',
      objectId: 'company',
      type: 'Table',
      workspaceId,
    },
  });

  await Promise.all(
    [
      {
        key: 'name',
        fieldName: 'Name',
        sizeInPx: 180,
      },
      {
        key: 'domainName',
        fieldName: 'URL',
        sizeInPx: 100,
      },
      {
        key: 'accountOwner',
        fieldName: 'Account Owner',
        sizeInPx: 150,
      },
      {
        key: 'createdAt',
        fieldName: 'Creation',
        sizeInPx: 150,
      },
      {
        key: 'employees',
        fieldName: 'Employees',
        sizeInPx: 150,
      },
      {
        key: 'linkedin',
        fieldName: 'LinkedIn',
        sizeInPx: 170,
      },
      {
        key: 'address',
        fieldName: 'Address',
        sizeInPx: 170,
      },
      {
        key: 'annualRecurringRevenue',
        fieldName: 'ARR',
        sizeInPx: 150,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { viewId_key: { key: viewField.key, viewId: companyViewId } },
        update: {},
        create: {
          ...viewField,
          index: index + 1,
          isVisible: true,
          objectName: 'company',
          viewId: companyViewId,
          workspaceId,
        },
      }),
    ),
  );

  await prisma.view.upsert({
    where: { id: personViewId },
    update: {},
    create: {
      id: personViewId,
      name: 'All People',
      objectId: 'person',
      type: 'Table',
      workspaceId,
    },
  });

  await Promise.all(
    [
      {
        key: 'displayName',
        fieldName: 'People',
        sizeInPx: 210,
      },
      {
        key: 'email',
        fieldName: 'Email',
        sizeInPx: 150,
      },
      {
        key: 'company',
        fieldName: 'Company',
        sizeInPx: 150,
      },
      {
        key: 'phone',
        fieldName: 'Phone',
        sizeInPx: 150,
      },
      {
        key: 'createdAt',
        fieldName: 'Creation',
        sizeInPx: 150,
      },
      {
        key: 'city',
        fieldName: 'City',
        sizeInPx: 150,
      },
      {
        key: 'jobTitle',
        fieldName: 'Job title',
        sizeInPx: 150,
      },
      {
        key: 'linkedin',
        fieldName: 'LinkedIn',
        sizeInPx: 150,
      },
      {
        key: 'x',
        fieldName: 'Twitter',
        sizeInPx: 150,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { viewId_key: { key: viewField.key, viewId: personViewId } },
        update: {},
        create: {
          ...viewField,
          index: index + 1,
          isVisible: true,
          objectName: 'person',
          viewId: personViewId,
          workspaceId,
        },
      }),
    ),
  );
};
