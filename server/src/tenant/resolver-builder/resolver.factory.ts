import { Injectable, Logger } from '@nestjs/common';

import { IResolvers } from '@graphql-tools/utils';

import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { getResolverName } from 'src/tenant/utils/get-resolver-name.util';

import { FindManyResolverFactory } from './factories/find-many-resolver.factory';
import { FindOneResolverFactory } from './factories/find-one-resolver.factory';
import { CreateManyResolverFactory } from './factories/create-many-resolver.factory';
import { CreateOneResolverFactory } from './factories/create-one-resolver.factory';
import { UpdateOneResolverFactory } from './factories/update-one-resolver.factory';
import { DeleteOneResolverFactory } from './factories/delete-one-resolver.factory';
import {
  ResolverBuilderMethodNames,
  ResolverBuilderMethods,
} from './interfaces/resolvers-builder.interface';
import { ResolverBuilderFactoryInterface } from './interfaces/resolver-builder-factory.interface';

@Injectable()
export class ResolverFactory {
  private readonly logger = new Logger(ResolverFactory.name);

  constructor(
    private readonly findManyResolverFactory: FindManyResolverFactory,
    private readonly findOneResolverFactory: FindOneResolverFactory,
    private readonly createManyResolverFactory: CreateManyResolverFactory,
    private readonly createOneResolverFactory: CreateOneResolverFactory,
    private readonly updateOneResolverFactory: UpdateOneResolverFactory,
    private readonly deleteOneResolverFactory: DeleteOneResolverFactory,
  ) {}

  async create(
    workspaceId: string,
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverBuilderMethods: ResolverBuilderMethods,
  ): Promise<IResolvers> {
    const factories = new Map<
      ResolverBuilderMethodNames,
      ResolverBuilderFactoryInterface
    >([
      ['findMany', this.findManyResolverFactory],
      ['findOne', this.findOneResolverFactory],
      ['createMany', this.createManyResolverFactory],
      ['createOne', this.createOneResolverFactory],
      ['updateOne', this.updateOneResolverFactory],
      ['deleteOne', this.deleteOneResolverFactory],
    ]);
    const resolvers: IResolvers = {
      Query: {},
      Mutation: {},
    };

    for (const objectMetadata of objectMetadataCollection) {
      // Generate query resolvers
      for (const methodName of resolverBuilderMethods.queries) {
        const resolverName = getResolverName(objectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown query resolver type: ${methodName}`, {
            objectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown query resolver type: ${methodName}`);
        }

        resolvers.Query[resolverName] = resolverFactory.create({
          workspaceId,
          targetTableName: objectMetadata.targetTableName,
          fieldMetadataCollection: objectMetadata.fields,
        });
      }

      // Generate mutation resolvers
      for (const methodName of resolverBuilderMethods.mutations) {
        const resolverName = getResolverName(objectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown mutation resolver type: ${methodName}`, {
            objectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown mutation resolver type: ${methodName}`);
        }

        resolvers.Mutation[resolverName] = resolverFactory.create({
          workspaceId,
          targetTableName: objectMetadata.targetTableName,
          fieldMetadataCollection: objectMetadata.fields,
        });
      }
    }

    return resolvers;
  }
}
