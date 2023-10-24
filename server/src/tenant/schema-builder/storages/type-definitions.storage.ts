import { Injectable } from '@nestjs/common';

import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';

import { InputTypeDefinition } from 'src/tenant/schema-builder/factories/input-type-definition.factory';
import { ObjectTypeDefinition } from 'src/tenant/schema-builder/factories/object-type-definition.factory';

@Injectable()
export class TypeDefinitionsStorage {
  private readonly objectTypeDefinitions = new Map<
    string,
    ObjectTypeDefinition
  >();
  private readonly inputTypeDefinitions = new Map<
    string,
    InputTypeDefinition
  >();

  addObjectTypes(objectDefs: ObjectTypeDefinition[]) {
    objectDefs.forEach((item) =>
      this.objectTypeDefinitions.set(item.target, item),
    );
  }

  getObjectTypeByTarget(target: string): GraphQLObjectType | undefined {
    return this.objectTypeDefinitions.get(target)?.type;
  }

  getAllObjectTypeDefinitions(): ObjectTypeDefinition[] {
    return Array.from(this.objectTypeDefinitions.values());
  }

  addInputTypes(inputDefs: InputTypeDefinition[]) {
    inputDefs.forEach((item) =>
      this.inputTypeDefinitions.set(item.target, item),
    );
  }

  getInputTypeByTarget(target: string): GraphQLInputObjectType | undefined {
    return this.inputTypeDefinitions.get(target)?.type;
  }

  getAllInputTypeDefinitions(): InputTypeDefinition[] {
    return Array.from(this.inputTypeDefinitions.values());
  }
}
