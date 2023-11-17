import { Injectable, Scope } from '@nestjs/common';

import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';

import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from 'src/workspace/workspace-schema-builder/factories/input-type-definition.factory';
import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from 'src/workspace/workspace-schema-builder/factories/object-type-definition.factory';

// Must be scoped on REQUEST level
@Injectable({ scope: Scope.REQUEST })
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
      this.objectTypeDefinitions.set(
        this.generateCompositeKey(item.target, item.kind),
        item,
      ),
    );
  }

  getObjectTypeByKey(
    target: string,
    kind: ObjectTypeDefinitionKind,
  ): GraphQLObjectType | undefined {
    return this.objectTypeDefinitions.get(
      this.generateCompositeKey(target, kind),
    )?.type;
  }

  getAllObjectTypeDefinitions(): ObjectTypeDefinition[] {
    return Array.from(this.objectTypeDefinitions.values());
  }

  addInputTypes(inputDefs: InputTypeDefinition[]) {
    inputDefs.forEach((item) =>
      this.inputTypeDefinitions.set(
        this.generateCompositeKey(item.target, item.kind),
        item,
      ),
    );
  }

  getInputTypeByKey(
    target: string,
    kind: InputTypeDefinitionKind,
  ): GraphQLInputObjectType | undefined {
    return this.inputTypeDefinitions.get(
      this.generateCompositeKey(target, kind),
    )?.type;
  }

  getAllInputTypeDefinitions(): InputTypeDefinition[] {
    return Array.from(this.inputTypeDefinitions.values());
  }

  private generateCompositeKey(
    target: string | FieldMetadataType,
    kind: ObjectTypeDefinitionKind | InputTypeDefinitionKind,
  ): string {
    return `${target.toString()}_${kind.toString()}`;
  }
}
