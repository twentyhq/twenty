import { Injectable } from '@nestjs/common';

import {
  ArrowFunction,
  FunctionDeclaration,
  ParameterDeclaration,
  Project,
  SyntaxKind,
} from 'ts-morph';

import { FunctionParameter } from 'src/engine/metadata-modules/serverless-function/dtos/function-parameter.dto';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  CodeIntrospectionException,
  CodeIntrospectionExceptionCode,
} from 'src/modules/code-introspection/code-introspection.exception';

@Injectable()
export class CodeIntrospectionService {
  private project: Project;

  constructor() {
    this.project = new Project();
  }

  public generateInputData(fileContent: string, fileName = 'temp.ts') {
    const parameters = this.getFunctionInputSchema(fileContent, fileName);

    return this.generateFakeDataFromParams(parameters);
  }

  public getFunctionInputSchema(
    fileContent: string,
    fileName = 'temp.ts',
  ): FunctionParameter[] {
    const sourceFile = this.project.createSourceFile(fileName, fileContent, {
      overwrite: true,
    });

    const functionDeclarations = sourceFile.getFunctions();

    if (functionDeclarations.length > 0) {
      return this.getFunctionParameters(functionDeclarations);
    }

    const arrowFunctions = sourceFile.getDescendantsOfKind(
      SyntaxKind.ArrowFunction,
    );

    if (arrowFunctions.length > 0) {
      return this.getArrowFunctionParameters(arrowFunctions);
    }

    return [];
  }

  private getFunctionParameters(
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

  private getArrowFunctionParameters(
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

  private generateFakeDataFromParams(
    params: FunctionParameter[],
  ): Record<string, any> {
    return params.reduce((acc, param) => {
      acc[param.name] = generateFakeValue(param.type);

      return acc;
    }, {});
  }
}
