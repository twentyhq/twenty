import { PrismaClient } from '@prisma/client';
export const seedPipelines = async (prisma: PrismaClient) => {
  await prisma.pipeline.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      name: 'Sales pipeline',
      icon: '💰',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      pipelineProgressableType: 'Company',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
      name: 'New',
      color: '#B76796',
      index: 0,
      type: 'open',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe4-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe4-8998-b76aa0bfb600',
      name: 'Screening',
      color: '#CB912F',
      index: 1,
      type: 'ongoing',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe5-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe5-8998-b76aa0bfb600',
      name: 'Meeting',
      color: '#9065B0',
      index: 2,
      type: 'ongoing',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe6-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe6-8998-b76aa0bfb600',
      name: 'Proposal',
      color: '#337EA9',
      index: 3,
      type: 'ongoing',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
      name: 'Customer',
      color: '#079039',
      index: 4,
      type: 'won',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineProgress.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      pipelineStageId: 'twenty-fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
      progressableType: 'Company',
      progressableId: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineProgress.upsert({
    where: { id: 'twenty-4a886c90-f4f2-4984-8222-882ebbb905d6' },
    update: {},
    create: {
      id: 'twenty-4a886c90-f4f2-4984-8222-882ebbb905d6',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      pipelineStageId: 'twenty-fe256b39-3ec3-4fe4-8998-b76aa0bfb600',
      progressableType: 'Company',
      progressableId: 'twenty-118995f3-5d81-46d6-bf83-f7fd33ea6102',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineProgress.upsert({
    where: { id: 'twenty-af92f3eb-d51d-4528-9b97-b8f132865b00' },
    update: {},
    create: {
      id: 'twenty-af92f3eb-d51d-4528-9b97-b8f132865b00',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      pipelineStageId: 'twenty-fe256b39-3ec3-4fe5-8998-b76aa0bfb600',
      progressableType: 'Company',
      progressableId: 'twenty-04b2e9f5-0713-40a5-8216-82802401d33e',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineProgress.upsert({
    where: { id: 'twenty-08369b1a-acdb-43d6-95f9-67ac7436941a' },
    update: {},
    create: {
      id: 'twenty-08369b1a-acdb-43d6-95f9-67ac7436941a',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      pipelineStageId: 'twenty-fe256b39-3ec3-4fe5-8998-b76aa0bfb600',
      progressableType: 'Company',
      progressableId: 'twenty-460b6fb1-ed89-413a-b31a-962986e67bb4',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipeline.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b74aa0bfb400' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b74aa0bfb400',
      name: 'Customer support pipeline',
      icon: '📔',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      pipelineProgressableType: 'Person',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8998-a76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8998-a76aa0bfb600',
      name: 'New',
      color: '#B76796',
      index: 1,
      type: 'open',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b74aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipelineProgress.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
      pipelineId: 'twenty-fe256b39-3ec3-4fe3-8997-b74aa0bfb400',
      pipelineStageId: 'twenty-fe256b39-3ec3-4fe3-8998-a76aa0bfb600',
      progressableType: 'Person',
      progressableId: 'twenty-755035db-623d-41fe-92e7-dd45b7c568e1',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
    },
  });

  await prisma.pipeline.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      name: 'Sales pipeline',
      icon: '💰',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
      pipelineProgressableType: 'Person',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
      name: 'New',
      color: '#B76796',
      index: 0,
      type: 'open',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe4-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe4-8998-b76aa0bfb600',
      name: 'Screening',
      color: '#CB912F',
      index: 1,
      type: 'ongoing',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe5-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe5-8998-b76aa0bfb600',
      name: 'Meeting',
      color: '#9065B0',
      index: 2,
      type: 'ongoing',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe6-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe6-8998-b76aa0bfb600',
      name: 'Proposal',
      color: '#337EA9',
      index: 3,
      type: 'ongoing',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe7-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe7-8998-b76aa0bfb600',
      name: 'Customer',
      color: '#079039',
      index: 4,
      type: 'won',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });
};
