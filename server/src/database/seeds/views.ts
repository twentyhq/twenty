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
        name: 'Name',
        size: 180,
      },
      {
        key: 'domainName',
        name: 'URL',
        size: 100,
      },
      {
        key: 'accountOwner',
        name: 'Account Owner',
        size: 150,
      },
      {
        key: 'createdAt',
        name: 'Creation',
        size: 150,
      },
      {
        key: 'employees',
        name: 'Employees',
        size: 150,
      },
      {
        key: 'linkedin',
        name: 'LinkedIn',
        size: 170,
      },
      {
        key: 'address',
        name: 'Address',
        size: 170,
      },
      {
        key: 'annualRecurringRevenue',
        name: 'ARR',
        size: 150,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { viewId_key: { key: viewField.key, viewId: companyViewId } },
        update: {},
        create: {
          ...viewField,
          index,
          isVisible: true,
          objectId: 'company',
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
        name: 'People',
        size: 210,
      },
      {
        key: 'email',
        name: 'Email',
        size: 150,
      },
      {
        key: 'company',
        name: 'Company',
        size: 150,
      },
      {
        key: 'phone',
        name: 'Phone',
        size: 150,
      },
      {
        key: 'createdAt',
        name: 'Creation',
        size: 150,
      },
      {
        key: 'city',
        name: 'City',
        size: 150,
      },
      {
        key: 'jobTitle',
        name: 'Job title',
        size: 150,
      },
      {
        key: 'linkedin',
        name: 'LinkedIn',
        size: 150,
      },
      {
        key: 'x',
        name: 'Twitter',
        size: 150,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { viewId_key: { key: viewField.key, viewId: personViewId } },
        update: {},
        create: {
          ...viewField,
          index,
          isVisible: true,
          objectId: 'person',
          viewId: personViewId,
          workspaceId,
        },
      }),
    ),
  );
};
