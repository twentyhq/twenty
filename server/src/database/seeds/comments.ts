import { PrismaClient } from '@prisma/client';
export const seedComments = async (prisma: PrismaClient) => {
  await prisma.commentThread.upsert({
    where: { id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400' },
    update: {},
    create: {
      id: 'twenty-fe256b39-3ec3-4fe3-8997-b76aa0bfb400',
      workspaceId: 'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
      title: 'Performance update',
      body: '[{"id":"555df0c3-ab88-4c62-abae-c9b557c37c5b","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"In the North American region, we have observed a strong growth rate of 18% in sales. Europe followed suit with a significant 14% increase, while Asia-Pacific sustained its performance with a steady 10% rise. Special kudos to the North American team for the excellent work done in penetrating new markets and establishing stronger footholds in the existing ones.","styles":{}}],"children":[]},{"id":"13530934-b3ce-4332-9238-3760aa4acb3e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
      authorId: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
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
      title: 'Buyout Proposal',
      body: '[{"id":"333df0c3-ab88-4c62-abae-c9b557c37c5b","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"We are considering the potential acquisition of [Company], a leading company in [Industry/Specific Technology]. This company has demonstrated remarkable success and pioneering advancements in their field, paralleling our own commitment to progress. By integrating their expertise with our own, we believe that we can amplify our growth, broaden our offerings, and fortify our position at the forefront of technology. This prospective partnership could help to ensure our continued leadership in the industry and allow us to deliver even more innovative solutions for our customers.","styles":{}}],"children":[]},{"id":"13530934-b3ce-4332-9238-3760aa4acb3e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
      authorId: 'twenty-ge256b39-3ec3-4fe3-8997-b76aa0bfa408',
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
      title: 'Call summary',
      body: '[{"id":"555df0c3-ab88-4c62-abae-c9b557c37c5b","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Valuation & Due Diligence: The CFO highlighted the financial implications, pointing out that the acquisition will be accretive to earnings. The M&A team has been directed to commence due diligence and work closely with legal counsel to assess all aspects of the acquisition.","styles":{}}],"children":[]},{"id":"13530934-b3ce-4332-9238-3760aa4acb3e","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}]',
      authorId: 'twenty-dev-gk256b39-3ec3-4fe3-8997-b76aa0boa408',
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
