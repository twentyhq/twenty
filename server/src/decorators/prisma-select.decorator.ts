import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  PrismaSelect,
  ModelSelectMap,
  DefaultFieldsMap,
} from 'src/utils/prisma-select';

export { PrismaSelect };

export const PrismaSelector = createParamDecorator(
  (
    data: {
      modelName: keyof ModelSelectMap;
      defaultFields?: DefaultFieldsMap;
    },
    ctx: ExecutionContext,
  ): PrismaSelect<keyof ModelSelectMap> => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const info = gqlCtx.getInfo();

    return new PrismaSelect(data.modelName, info, {
      defaultFields: data.defaultFields,
    });
  },
);
