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
        id: 'twenty-388833ba-1343-49d7-9092-065f92e0e5fa',
        fieldName: 'Name',
        sizeInPx: 180,
        isVisible: true,
      },
      {
        id: 'twenty-fdbb7a60-18ac-4d52-83b8-399eb6055ec6',
        fieldName: 'URL',
        sizeInPx: 100,
        isVisible: true,
      },
      {
        id: 'twenty-cc77beef-af99-4cd2-86dd-0230f8565ed5',
        fieldName: 'Account Owner',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-28537b67-8b78-4885-903d-f749f34883b1',
        fieldName: 'Creation',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-59e6624d-9a4d-492d-a0f2-52f51f69d004',
        fieldName: 'Employees',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-2c4ee8b9-aacd-42dd-b422-22eca03aab5a',
        fieldName: 'LinkedIn',
        sizeInPx: 170,
        isVisible: true,
      },
      {
        id: 'twenty-b83e299f-7098-4748-a39e-431cca2907ab',
        fieldName: 'Address',
        sizeInPx: 170,
        isVisible: true,
      },
      {
        id: 'twenty-acef1246-8461-4e34-96b9-f326d598d655',
        fieldName: 'ICP',
        sizeInPx: 150,
        isVisible: false,
      },
      {
        id: 'twenty-971828c5-8167-4997-ae13-3b7895faa6f2',
        fieldName: 'ARR',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-90977d8a-328d-4f69-98e8-8c69723c5a18',
        fieldName: 'Twitter',
        sizeInPx: 150,
        isVisible: false,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { id: viewField.id },
        update: {},
        create: {
          ...viewField,
          index: index + 1,
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
        id: 'twenty-fc3461b4-661d-492e-8907-61004a41cca6',
        fieldName: 'People',
        sizeInPx: 210,
        isVisible: true,
      },
      {
        id: 'twenty-4724d413-4343-4528-b8c4-4431910722f8',
        fieldName: 'Email',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-fbb16b08-5a58-4a69-8bd0-a6d267994042',
        fieldName: 'Company',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-1bad57bb-6627-40f8-8c75-bb5902892273',
        fieldName: 'Phone',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-3544d797-740b-4e0b-8226-134bf38da256',
        fieldName: 'Creation',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-4b6d48fb-17e2-4071-8565-d512f84656d5',
        fieldName: 'City',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-418849cc-aa5c-4835-822b-c0dfb076106b',
        fieldName: 'Job title',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-7591af5d-e081-4afa-94bb-09bd0e517850',
        fieldName: 'LinkedIn',
        sizeInPx: 150,
        isVisible: true,
      },
      {
        id: 'twenty-e7baeb3d-8ef3-4e61-89d6-60f64b1d52c5',
        fieldName: 'Twitter',
        sizeInPx: 150,
        isVisible: true,
      },
    ].map((viewField, index) =>
      prisma.viewField.upsert({
        where: { id: viewField.id },
        update: {},
        create: {
          ...viewField,
          index: index + 1,
          objectName: 'person',
          viewId: personViewId,
          workspaceId,
        },
      }),
    ),
  );
};
