import { GraphQLFieldResolver } from 'graphql';

export type Resolver<Args = any> = GraphQLFieldResolver<any, any, Args>;

export interface FindManyArgs<Filter = any, OrderBy = any> {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  filter?: Filter;
  orderBy?: OrderBy;
}

export interface FindOneArgs<Filter = any> {
  filter?: Filter;
}

export interface CreateOneArgs<Data = any> {
  data: Data;
}

export interface CreateManyArgs<Data = any> {
  data: Data[];
}

export interface UpdateOneArgs<Data = any> {
  id: string;
  data: Data;
}

export interface SchemaQueryResolvers {
  findMany: Resolver<FindManyArgs>;
  findOne: Resolver<FindOneArgs>;
}

export interface SchemaMutationResolvers {
  createMany: Resolver<CreateManyArgs>;
  createOne: Resolver<CreateOneArgs>;
  updateOne: Resolver<CreateOneArgs>;
  deleteOne: Resolver;
}

export type ResolverMethodNames =
  | keyof SchemaQueryResolvers
  | keyof SchemaMutationResolvers;

export interface SchemaResolvers {
  query: SchemaQueryResolvers;
  mutation: SchemaMutationResolvers;
}
