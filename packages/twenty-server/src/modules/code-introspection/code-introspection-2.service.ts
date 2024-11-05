import { Injectable } from '@nestjs/common';

import {
  ScriptTarget,
  createSourceFile,
  SyntaxKind,
  TypeNode,
  ArrayTypeNode,
  UnionTypeNode,
  LiteralTypeNode,
  StringLiteral,
  PropertySignature,
} from 'typescript';

type SchemaPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'unknown';

interface SchemaProperty {
  type: SchemaPropertyType;
  enum?: string[] | undefined;
  items?: SchemaProperty;
  properties?: Schema;
}

interface Schema {
  [name: string]: SchemaProperty;
}

@Injectable()
export class CodeIntrospectionService2 {
  public getFunctionInputSchema(fileContent: string): Schema | null {
    const sourceFile = createSourceFile(
      'temp.ts',
      fileContent,
      ScriptTarget.ESNext,
      true,
    );

    const schema: Schema = {};

    sourceFile.forEachChild((node) => {
      if (node.kind === SyntaxKind.FunctionDeclaration) {
        const funcNode = node as any;
        const params = funcNode.parameters;

        params.forEach((param: any) => {
          const paramName = param.name.text;
          const typeNode = param.type;

          if (typeNode) {
            schema[paramName] = this.getTypeString(typeNode);
          } else {
            schema[paramName] = { type: 'unknown' };
          }
        });
      }
    });

    return schema;
  }

  private getTypeString(typeNode: TypeNode): SchemaProperty {
    switch (typeNode.kind) {
      case SyntaxKind.NumberKeyword:
        return { type: 'number' };
      case SyntaxKind.StringKeyword:
        return { type: 'string' };
      case SyntaxKind.BooleanKeyword:
        return { type: 'boolean' };
      case SyntaxKind.ArrayType:
        return {
          type: 'array',
          items: this.getTypeString((typeNode as ArrayTypeNode).elementType),
        };
      case SyntaxKind.ObjectKeyword:
        return { type: 'object' };
      case SyntaxKind.TypeLiteral: {
        const properties: Schema = {};

        (typeNode as any).members.forEach((member: PropertySignature) => {
          if (member.name && member.type) {
            const memberName = (member.name as any).text;

            properties[memberName] = this.getTypeString(member.type);
          }
        });

        return { type: 'object', properties };
      }
      case SyntaxKind.UnionType: {
        const unionNode = typeNode as UnionTypeNode;
        const enumValues: string[] = [];

        let isEnum = true;

        unionNode.types.forEach((subType) => {
          if (subType.kind === SyntaxKind.LiteralType) {
            const literal = (subType as LiteralTypeNode).literal;

            if (literal.kind === SyntaxKind.StringLiteral) {
              enumValues.push((literal as StringLiteral).text);
            } else {
              isEnum = false;
            }
          } else {
            isEnum = false;
          }
        });

        if (isEnum) {
          return { type: 'string', enum: enumValues };
        }

        return { type: 'unknown' };
      }
      default:
        return { type: 'unknown' };
    }
  }
}
