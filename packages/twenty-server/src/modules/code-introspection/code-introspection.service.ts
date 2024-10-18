import { Injectable } from '@nestjs/common';

import {
  ArrowFunction,
  FunctionDeclaration,
  ParameterDeclaration,
  Project,
  SyntaxKind,
} from 'ts-morph';

import {
  CodeIntrospectionException,
  CodeIntrospectionExceptionCode,
} from 'src/modules/code-introspection/code-introspection.exception';

type FunctionParameter = {
  name: string;
  type: string;
};

@Injectable()
export class CodeIntrospectionService {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  public analyze(
    fileContent: string,
    fileName = 'temp.ts',
  ): FunctionParameter[] {
    const sourceFile = this.project.createSourceFile(fileName, fileContent, {
      overwrite: true,
    });

    const functionDeclarations = sourceFile.getFunctions();

    if (functionDeclarations.length > 0) {
      return this.analyzeFunctions(functionDeclarations);
    }

    const arrowFunctions = sourceFile.getDescendantsOfKind(
      SyntaxKind.ArrowFunction,
    );

    if (arrowFunctions.length > 0) {
      return this.analyzeArrowFunctions(arrowFunctions);
    }

    return [];
  }

  private analyzeFunctions(
    functionDeclarations: FunctionDeclaration[],
  ): FunctionParameter[] {
    if (functionDeclarations.length > 1) {
      throw new CodeIntrospectionException(
        'Only one function is allowed',
        CodeIntrospectionExceptionCode.ONLY_ONE_FUNCTION_ALLOWED,
      );
    }

    const functionDeclaration = functionDeclarations[0];

    return functionDeclaration.getParameters().map(this.buildFunctionParameter);
  }

  private analyzeArrowFunctions(
    arrowFunctions: ArrowFunction[],
  ): FunctionParameter[] {
    if (arrowFunctions.length > 1) {
      throw new CodeIntrospectionException(
        'Only one arrow function is allowed',
        CodeIntrospectionExceptionCode.ONLY_ONE_FUNCTION_ALLOWED,
      );
    }

    const arrowFunction = arrowFunctions[0];

    return arrowFunction.getParameters().map(this.buildFunctionParameter);
  }

  private buildFunctionParameter(
    parameter: ParameterDeclaration,
  ): FunctionParameter {
    return {
      name: parameter.getName(),
      type: parameter.getType().getText(),
    };
  }
}
