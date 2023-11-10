import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';

import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from './object-type-definition.factory';
import { ConnectionTypeFactory } from './connection-type.factory';

export enum ConnectionTypeDefinitionKind {
  Edge = 'Edge',
  PageInfo = 'PageInfo',
}

@Injectable()
export class ConnectionTypeDefinitionFactory {
  private readonly logger = new Logger(ConnectionTypeDefinitionFactory.name);

  constructor(private readonly connectionTypeFactory: ConnectionTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): ObjectTypeDefinition {
    const kind = ObjectTypeDefinitionKind.Connection;

    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: () => this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    fields.edges = {
      type: this.connectionTypeFactory.create(
        objectMetadata,
        ConnectionTypeDefinitionKind.Edge,
        options,
        {
          isArray: true,
          arrayDepth: 1,
          nullable: false,
        },
      ),
    };

    fields.pageInfo = {
      type: this.connectionTypeFactory.create(
        objectMetadata,
        ConnectionTypeDefinitionKind.PageInfo,
        options,
        {
          nullable: false,
        },
      ),
    };

    return fields;
  }
}
