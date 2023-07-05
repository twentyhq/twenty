import { PrismaSelect as PalJSPrismaSelect } from '@paljs/plugins';
import { DMMF } from '@prisma/client/runtime';
import { GraphQLResolveInfo } from 'graphql';
import { ModelSelectMap } from './model-select-map';

export type DefaultFieldsMap = {
  readonly [K in keyof ModelSelectMap]?:
    | ModelSelectMap[K]
    | ((select: any) => ModelSelectMap[K]);
};

export { ModelSelectMap };

export class PrismaSelect<
  K extends keyof ModelSelectMap,
> extends PalJSPrismaSelect {
  private modelName: K;

  constructor(
    modelName: K,
    info: GraphQLResolveInfo,
    options?: {
      readonly defaultFields?: DefaultFieldsMap;
      readonly dmmf?: readonly Pick<DMMF.Document, 'datamodel'>[];
    },
  ) {
    super(info, options as any);
    this.modelName = modelName;
  }

  get value(): ModelSelectMap[K] {
    return super.value;
  }

  valueOf(field: string, mergeObject?: any): ModelSelectMap[K];
  valueOf<SubKey extends keyof ModelSelectMap>(
    field: string,
    filterBy: SubKey,
    mergeObject?: any,
  ): ModelSelectMap[SubKey];
  valueOf(
    field: string,
    filterByOrMergeObject?: keyof ModelSelectMap | any,
    mergeObject?: any,
  ) {
    if (typeof filterByOrMergeObject === 'string') {
      return super.valueOf(field, filterByOrMergeObject, mergeObject).select;
    } else {
      return super.valueOf(field, this.modelName, filterByOrMergeObject).select;
    }
  }

  valueWithFilter(modelName: K): ModelSelectMap[K] {
    return super.valueWithFilter(modelName).select;
  }
}
