import { PrismaClient, Prisma } from '@prisma/client';

import { camelCase } from 'src/utils/camel-case';

const prisma = new PrismaClient();

export default async () => {
  const models = Prisma.dmmf.datamodel.models;
  const modelNames = models.map((model) => model.name);
  const entities = modelNames.map((modelName) => camelCase(modelName));

  await prisma.$transaction(
    entities.map((entity) => {
      console.log('entity: ', entity);
      return prisma[entity].deleteMany();
    }),
  );
};
