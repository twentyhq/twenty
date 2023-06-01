import { PrismaClient } from '@prisma/client';
export const seedComments = async (prisma: PrismaClient) => {
  await prisma.commentThread.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.commentThreadTarget.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb600',
      commentableType: 'Company',
      commentableId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      commentThreadId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb200' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb200',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      body: 'Hi Félix ! How do you like your Twenty workspace?',
      commentThreadId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
      authorId: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'twenty-fe256b40-3ec3-4fe3-8997-b76aa0bfb200' },
    update: {},
    create: {
      id: 'twenty-fe256b40-3ec3-4fe3-8997-b76aa0bfb200',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      body: 'I love it!',
      commentThreadId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
      authorId: 'twenty-gk256b39-3ec3-4fe3-8997-b76aa0bfa408',
    },
  });

  await prisma.commentThread.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfc408' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfc408',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.commentThreadTarget.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-a76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-a76aa0bfb600',
      commentableType: 'Person',
      commentableId: 'twenty-755035db-623d-41fe-92e7-dd45b7c568e1',
      commentThreadId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfc408',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb100' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb100',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      body: 'I really like this comment thread feature!',
      commentThreadId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfc408',
      authorId: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
    },
  });

  await prisma.commentThread.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aaabfb408' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aaabfb408',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });

  await prisma.commentThreadTarget.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-a76aa0bfba00' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-a76aa0bfba00',
      commentableType: 'Company',
      commentableId: 'twenty-dev-a674fa6c-1455-4c57-afaf-dd5dc086361e',
      commentThreadId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aaabfb408',
    },
  });

  await prisma.comment.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aa0bfb000' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aa0bfb000',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
      body: 'I really like this comment thread feature!',
      commentThreadId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b76aaabfb408',
      authorId: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408',
    },
  });
};
