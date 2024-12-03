import { Injectable } from '@nestjs/common';

import {
  ArrayTypeNode,
  createSourceFile,
  LiteralTypeNode,
  PropertySignature,
  ScriptTarget,
  StringLiteral,
  SyntaxKind,
  TypeNode,
  UnionTypeNode,
  VariableStatement,
  ArrowFunction,
  FunctionDeclaration,
} from 'typescript';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { isDefined } from 'src/utils/is-defined';
import {
  InputSchema,
  InputSchemaProperty,
} from 'src/modules/code-introspection/types/input-schema.type';

@Injectable()
export class CodeIntrospectionService {
  public generateInputData(inputSchema: InputSchema, setNullValue = false) {
    return Object.entries(inputSchema).reduce((acc, [key, value]) => {
      if (isDefined(value.enum)) {
        acc[key] = value.enum?.[0];
      } else if (['string', 'number', 'boolean'].includes(value.type)) {
        acc[key] = setNullValue ? null : generateFakeValue(value.type);
      } else if (value.type === 'object') {
        acc[key] = isDefined(value.properties)
          ? this.generateInputData(value.properties, setNullValue)
          : {};
      } else if (value.type === 'array' && isDefined(value.items)) {
        acc[key] = [generateFakeValue(value.items.type)];
      }

      return acc;
    }, {});
  }

  public getFunctionInputSchema(fileContent: string): InputSchema {
    const sourceFile = createSourceFile(
      'temp.ts',
      fileContent,
      ScriptTarget.ESNext,
      true,
    );

    const schema: InputSchema = {};

    sourceFile.forEachChild((node) => {
      if (node.kind === SyntaxKind.FunctionDeclaration) {
        const funcNode = node as FunctionDeclaration;
        const params = funcNode.parameters;

        params.forEach((param) => {
          const paramName = param.name.getText();
          const typeNode = param.type;

          if (typeNode) {
            schema[paramName] = this.getTypeString(typeNode);
          } else {
            schema[paramName] = { type: 'unknown' };
          }
        });
      } else if (node.kind === SyntaxKind.VariableStatement) {
        const varStatement = node as VariableStatement;

        varStatement.declarationList.declarations.forEach((declaration) => {
          if (
            declaration.initializer &&
            declaration.initializer.kind === SyntaxKind.ArrowFunction
          ) {
            const arrowFunction = declaration.initializer as ArrowFunction;
            const params = arrowFunction.parameters;

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
      }
    });

    return schema;
  }

  private getTypeString(typeNode: TypeNode): InputSchemaProperty {
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
        const properties: InputSchema = {};

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
