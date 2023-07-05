import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import merge from 'lodash.merge';
import {
  PrismaSelect,
  ModelSelectMap,
  DefaultFieldsMap,
} from 'src/utils/prisma-select';

export { PrismaSelect };

const globalDefaultFields: DefaultFieldsMap = {
  User: {
    // Needed for displayName resolve field
    firstName: true,
    lastName: true,
  },
};

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
      defaultFields: merge(globalDefaultFields, data.defaultFields),
    });
  },
);
