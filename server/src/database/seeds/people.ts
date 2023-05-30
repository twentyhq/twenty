import { PrismaClient } from '@prisma/client';
export const seedPeople = async (prisma: PrismaClient) => {
  await prisma.person.upsert({
    where: { id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5' },
    update: {},
    create: {
      id: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
      firstname: 'Christoph',
      lastname: 'Callisto',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33789012345',
      city: 'Seattle',
      companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      email: 'christoph.calisto@linkedin.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '0aa00beb-ac73-4797-824e-87a1f5aea9e0' },
    update: {},
    create: {
      id: '0aa00beb-ac73-4797-824e-87a1f5aea9e0',
      firstname: 'Sylvie',
      lastname: 'Palmer',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33780123456',
      city: 'Los Angeles',
      companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      email: 'sylvie.palmer@linkedin.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '93c72d2e-f517-42fd-80ae-14173b3b70ae' },
    update: {},
    create: {
      id: '93c72d2e-f517-42fd-80ae-14173b3b70ae',
      firstname: 'Christopher',
      lastname: 'Gonzalez',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33789012345',
      city: 'Seattle',
      companyId: '04b2e9f5-0713-40a5-8216-82802401d33e',
      email: 'christopher.gonzalez@qonto.com',
    },
  });

  await prisma.person.upsert({
    where: { id: 'eeeacacf-eee1-4690-ad2c-8619e5b56a2e' },
    update: {},
    create: {
      id: 'eeeacacf-eee1-4690-ad2c-8619e5b56a2e',
      firstname: 'Ashley',
      lastname: 'Parker',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33780123456',
      city: 'Los Angeles',
      companyId: '04b2e9f5-0713-40a5-8216-82802401d33e',
      email: 'ashley.parker@qonto.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '9b324a88-6784-4449-afdf-dc62cb8702f2' },
    update: {},
    create: {
      id: '9b324a88-6784-4449-afdf-dc62cb8702f2',
      firstname: 'Nicholas',
      lastname: 'Wright',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33781234567',
      city: 'Seattle',
      companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
      email: 'nicholas.wright@microsoft.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '1d151852-490f-4466-8391-733cfd66a0c8' },
    update: {},
    create: {
      id: '1d151852-490f-4466-8391-733cfd66a0c8',
      firstname: 'Isabella',
      lastname: 'Scott',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33782345678',
      city: 'New York',
      companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
      email: 'isabella.scott@microsoft.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '98406e26-80f1-4dff-b570-a74942528de3' },
    update: {},
    create: {
      id: '98406e26-80f1-4dff-b570-a74942528de3',
      firstname: 'Matthew',
      lastname: 'Green',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33783456789',
      city: 'Seattle',
      companyId: '460b6fb1-ed89-413a-b31a-962986e67bb4',
      email: 'matthew.green@microsoft.com',
    },
  });

  await prisma.person.upsert({
    where: { id: 'a2e78a5f-338b-46df-8811-fa08c7d19d35' },
    update: {},
    create: {
      id: 'a2e78a5f-338b-46df-8811-fa08c7d19d35',
      firstname: 'Elizabeth',
      lastname: 'Baker',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33784567890',
      city: 'New York',
      companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
      email: 'elizabeth.baker@airbnb.com',
    },
  });

  await prisma.person.upsert({
    where: { id: 'ca1f5bf3-64ad-4b0e-bbfd-e9fd795b7016' },
    update: {},
    create: {
      id: 'ca1f5bf3-64ad-4b0e-bbfd-e9fd795b7016',
      firstname: 'Christopher',
      lastname: 'Nelson',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33785678901',
      city: 'San Francisco',
      companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
      email: 'christopher.nelson@airbnb.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '56955422-5d54-41b7-ba36-f0d20e1417ae' },
    update: {},
    create: {
      id: '56955422-5d54-41b7-ba36-f0d20e1417ae',
      firstname: 'Avery',
      lastname: 'Carter',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33786789012',
      city: 'New York',
      companyId: '89bb825c-171e-4bcc-9cf7-43448d6fb278',
      email: 'avery.carter@airbnb.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '755035db-623d-41fe-92e7-dd45b7c568e1' },
    update: {},
    create: {
      id: '755035db-623d-41fe-92e7-dd45b7c568e1',
      firstname: 'Ethan',
      lastname: 'Mitchell',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33787890123',
      city: 'Los Angeles',
      companyId: '0d940997-c21e-4ec2-873b-de4264d89025',
      email: 'ethan.mitchell@google.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '240da2ec-2d40-4e49-8df4-9c6a049190ef' },
    update: {},
    create: {
      id: '240da2ec-2d40-4e49-8df4-9c6a049190ef',
      firstname: 'Madison',
      lastname: 'Perez',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33788901234',
      city: 'Seattle',
      companyId: '0d940997-c21e-4ec2-873b-de4264d89025',
      email: 'madison.perez@google.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '240da2ec-2d40-4e49-8df4-9c6a049190df' },
    update: {},
    create: {
      id: '240da2ec-2d40-4e49-8df4-9c6a049190df',
      firstname: 'Bertrand',
      lastname: 'Voulzy',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33788901234',
      city: 'Seattle',
      companyId: '0d940997-c21e-4ec2-873b-de4264d89025',
      email: 'bertrand.voulzy@google.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '240da2ec-2d40-4e49-8df4-9c6a049190dg' },
    update: {},
    create: {
      id: '240da2ec-2d40-4e49-8df4-9c6a049190dg',
      firstname: 'Louis',
      lastname: 'Duss',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      phone: '+33788901234',
      city: 'Seattle',
      companyId: '0d940997-c21e-4ec2-873b-de4264d89025',
      email: 'louis.duss@google.com',
    },
  });

  await prisma.person.upsert({
    where: { id: '240da2ec-2d40-4e49-8df4-9c6a049190dh' },
    update: {},
    create: {
      id: '240da2ec-2d40-4e49-8df4-9c6a049190dh',
      firstname: 'Lorie',
      lastname: 'Vladim',
      workspaceId: '7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
      phone: '+33788901235',
      city: 'Seattle',
      companyId: 'a674fa6c-1455-4c57-afaf-dd5dc086361e',
      email: 'lorie.vladim@google.com',
    },
  });
};
