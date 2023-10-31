import { GraphQLFieldResolver } from 'graphql';

import { resolverBuilderMethodNames } from 'src/tenant/resolver-builder/factories/factories';

import { Record, RecordFilter, RecordOrderBy } from './record.interface';

export type Resolver<Args = any> = GraphQLFieldResolver<any, any, Args>;

export interface FindManyResolverArgs<
  Filter extends RecordFilter = RecordFilter,
  OrderBy extends RecordOrderBy = RecordOrderBy,
> {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  filter?: Filter;
  orderBy?: OrderBy;
}

export interface FindOneResolverArgs<Filter = any> {
  filter?: Filter;
}

export interface CreateOneResolverArgs<Data extends Record = Record> {
  data: Data;
}

export interface CreateManyResolverArgs<Data extends Record = Record> {
  data: Data[];
}

export interface UpdateOneResolverArgs<Data extends Record = Record> {
  id: string;
  data: Data;
}

export interface DeleteOneResolverArgs {
  id: string;
}

export type ResolverBuilderQueryMethodNames =
  (typeof resolverBuilderMethodNames.queries)[number];

export type ResolverBuilderMutationMethodNames =
  (typeof resolverBuilderMethodNames.mutations)[number];

export type ResolverBuilderMethodNames =
  | ResolverBuilderQueryMethodNames
  | ResolverBuilderMutationMethodNames;

export interface ResolverBuilderMethods {
  readonly queries: readonly ResolverBuilderQueryMethodNames[];
  readonly mutations: readonly ResolverBuilderMutationMethodNames[];
}
