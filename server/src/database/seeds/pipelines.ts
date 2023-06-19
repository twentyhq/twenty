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
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
      name: 'New',
      color: '#B76796',
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
      progressableType: 'Person',
      progressableId: 'twenty-755035db-623d-41fe-92e7-dd45b7c568e1',
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
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8998-a76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8998-a76aa0bfb600',
      name: 'New',
      color: '#B76796',
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
    },
  });

  await prisma.pipelineStage.upsert({
    where: { id: 'twenty-dev-fe256b39-3ec3-4fe3-8998-b76aa0bfb600' },
    update: {},
    create: {
      id: 'twenty-dev-fe256b39-3ec3-4fe3-8998-b76aa0bfb600',
      name: 'New',
      color: '#B76796',
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
      type: 'won',
      pipelineId: 'twenty-dev-fe256b39-3ec3-4fe3-8997-b75aa0bfb400',
      workspaceId: 'twenty-dev-7ed9d212-1c25-4d02-bf25-6aeccf7ea420',
    },
  });
};
