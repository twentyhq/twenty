import { FindManyResolverFactory } from './find-many-resolver.factory';
import { FindOneResolverFactory } from './find-one-resolver.factory';
import { CreateManyResolverFactory } from './create-many-resolver.factory';
import { CreateOneResolverFactory } from './create-one-resolver.factory';
import { UpdateOneResolverFactory } from './update-one-resolver.factory';
import { DeleteOneResolverFactory } from './delete-one-resolver.factory';

export const workspaceResolverBuilderFactories = [
  FindManyResolverFactory,
  FindOneResolverFactory,
  CreateManyResolverFactory,
  CreateOneResolverFactory,
  UpdateOneResolverFactory,
  DeleteOneResolverFactory,
];

export const workspaceResolverBuilderMethodNames = {
  queries: [
    FindManyResolverFactory.methodName,
    FindOneResolverFactory.methodName,
  ],
  mutations: [
    CreateManyResolverFactory.methodName,
    CreateOneResolverFactory.methodName,
    UpdateOneResolverFactory.methodName,
    DeleteOneResolverFactory.methodName,
  ],
} as const;
