import {
  type ArrayTypeNode,
  type ArrowFunction,
  createSourceFile,
  type FunctionDeclaration,
  type FunctionLikeDeclaration,
  type Identifier,
  type LiteralTypeNode,
  type Node,
  type PropertySignature,
  ScriptTarget,
  type StringLiteral,
  SyntaxKind,
  type TypeNode,
  type TypeReferenceNode,
  type UnionTypeNode,
  type VariableStatement,
} from 'typescript';

import { type InputJsonSchema } from '@/logic-function';
import { type KnownObjectTypes } from '@/logic-function/known-object-types';
import { isDefined } from '@/utils/validation/isDefined';

const getTypeString = (
  typeNode: TypeNode,
  knownObjectTypes: KnownObjectTypes,
): InputJsonSchema => {
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
        items: getTypeString(
          (typeNode as ArrayTypeNode).elementType,
          knownObjectTypes,
        ),
      };
    case SyntaxKind.TypeReference: {
      const typeReferenceNode = typeNode as TypeReferenceNode;
      const typeName =
        typeReferenceNode.typeName.kind === SyntaxKind.Identifier
          ? (typeReferenceNode.typeName as Identifier).text
          : undefined;

      if (typeName === 'Array' || typeName === 'ReadonlyArray') {
        const elementType = typeReferenceNode.typeArguments?.[0];

        return {
          type: 'array',
          items: isDefined(elementType)
            ? getTypeString(elementType, knownObjectTypes)
            : {},
        };
      }

      const objectUniversalIdentifier = isDefined(typeName)
        ? knownObjectTypes[typeName]
        : undefined;

      if (isDefined(objectUniversalIdentifier)) {
        return { type: 'object', objectUniversalIdentifier };
      }

      return {};
    }
    case SyntaxKind.ObjectKeyword:
      return { type: 'object' };
    case SyntaxKind.TypeLiteral: {
      const properties: InputJsonSchema['properties'] = {};

      (typeNode as any).members.forEach((member: PropertySignature) => {
        if (isDefined(member.name) && isDefined(member.type)) {
          const memberName = (member.name as any).text;

          properties[memberName] = getTypeString(member.type, knownObjectTypes);
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

      return {};
    }
    default:
      return {};
  }
};

const computeFunctionParameters = (
  funcNode: FunctionDeclaration | FunctionLikeDeclaration | ArrowFunction,
  schema: InputJsonSchema[],
  knownObjectTypes: KnownObjectTypes,
): InputJsonSchema[] => {
  const params = funcNode.parameters;

  return params.reduce((updatedSchema, param) => {
    const typeNode = param.type;

    if (isDefined(typeNode)) {
      return [...updatedSchema, getTypeString(typeNode, knownObjectTypes)];
    } else {
      return [...updatedSchema, {}];
    }
  }, schema);
};

const extractFunctions = (node: Node): FunctionLikeDeclaration[] => {
  if (node.kind === SyntaxKind.FunctionDeclaration) {
    return [node as FunctionDeclaration];
  }

  if (node.kind === SyntaxKind.VariableStatement) {
    const varStatement = node as VariableStatement;

    return varStatement.declarationList.declarations
      .filter(
        (declaration) =>
          isDefined(declaration.initializer) &&
          declaration.initializer.kind === SyntaxKind.ArrowFunction,
      )
      .map((declaration) => declaration.initializer as ArrowFunction);
  }

  return [];
};

export const getFunctionInputSchema = (
  fileContent: string,
  options?: { knownObjectTypes?: KnownObjectTypes },
): InputJsonSchema[] => {
  const knownObjectTypes = options?.knownObjectTypes ?? {};
  const sourceFile = createSourceFile(
    'temp.ts',
    fileContent,
    ScriptTarget.ESNext,
    true,
  );
  let schema: InputJsonSchema[] = [];

  sourceFile.forEachChild((node) => {
    if (
      node.kind === SyntaxKind.FunctionDeclaration ||
      node.kind === SyntaxKind.VariableStatement
    ) {
      const functions = extractFunctions(node);

      functions.forEach((func) => {
        schema = computeFunctionParameters(func, schema, knownObjectTypes);
      });
    }
  });

  return schema;
};
