import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/workspace/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { WorkspaceResolverBuilderMutationMethodNames } from 'src/workspace/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { ObjectTypeName, RootTypeFactory } from './root-type.factory';

@Injectable()
export class MutationTypeFactory {
  constructor(private readonly rootTypeFactory: RootTypeFactory) {}

  create(
    objectMetadataCollection: ObjectMetadataInterface[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderMutationMethodNames[],
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLObjectType {
    return this.rootTypeFactory.create(
      objectMetadataCollection,
      workspaceResolverMethodNames,
      ObjectTypeName.Mutation,
      options,
    );
  }
}
