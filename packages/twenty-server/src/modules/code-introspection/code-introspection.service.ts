import { Injectable } from '@nestjs/common';

import {
  ArrowFunction,
  FunctionDeclaration,
  ParameterDeclaration,
  Project,
  SyntaxKind,
} from 'ts-morph';
import { faker } from '@faker-js/faker';

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

  public generateInputData(fileContent: string, fileName = 'temp.ts') {
    const parameters = this.analyze(fileContent, fileName);
    const fakeData = this.generateFakeDataFromParams(parameters);

    return fakeData;
  }

  private generateFakeDataFromParams(
    params: FunctionParameter[],
  ): Record<string, any> {
    const data: Record<string, any> = {};

    params.forEach((param) => {
      const type = param.type;

      data[param.name] = this.generateFakeValueFromType(type);
    });

    return data;
  }

  private generateFakeValueFromType(type: string): any {
    if (type === 'string') {
      return faker.lorem.word();
    } else if (type === 'number') {
      return faker.number.int();
    } else if (type === 'boolean') {
      return faker.datatype.boolean();
    } else if (type === 'Date') {
      return faker.date.recent();
    } else if (type.endsWith('[]')) {
      const elementType = type.replace('[]', '');

      return Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
        this.generateFakeValueFromType(elementType),
      );
    } else if (type.startsWith('{') && type.endsWith('}')) {
      return this.generateFakeObjectFromTypeString(type);
    } else {
      return faker.lorem.word();
    }
  }

  private generateFakeObjectFromTypeString(type: string): Record<string, any> {
    const objData: Record<string, any> = {};

    // Remove curly braces and split the object structure
    const properties = type
      .slice(1, -1)
      .split(';')
      .map((p) => p.trim())
      .filter((p) => p);

    properties.forEach((property) => {
      const [key, valueType] = property.split(':').map((s) => s.trim());

      objData[key] = this.generateFakeValueFromType(valueType);
    });

    return objData;
  }
}
