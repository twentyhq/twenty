import { Injectable } from '@nestjs/common';

import {
  type FieldNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type VariableNode,
  parse,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

export type ParsedQueryInfo = {
  objectName: string | null;
  recordId: string | null;
  fields: string[];
};

@Injectable()
export class QueryParserService {
  parseQueryForMatching(queryString: string): ParsedQueryInfo {
    try {
      const { query, variables } = JSON.parse(queryString) as {
        query: string;
        variables?: Record<string, unknown>;
      };

      const ast = parse(query);

      const firstOperation = ast.definitions.find(
        (def): def is OperationDefinitionNode =>
          def.kind === 'OperationDefinition',
      );

      if (!firstOperation) {
        return { objectName: null, recordId: null, fields: [] };
      }

      const rootSelection = firstOperation.selectionSet.selections[0];

      if (rootSelection.kind !== 'Field') {
        return { objectName: null, recordId: null, fields: [] };
      }

      const rootField = rootSelection as FieldNode;
      const objectName = rootField.name.value;

      const recordId = this.extractRecordId(rootField, variables);
      const fields = this.extractFieldNames(rootField.selectionSet);

      return { objectName, recordId, fields };
    } catch {
      return { objectName: null, recordId: null, fields: [] };
    }
  }

  private extractRecordId(
    field: FieldNode,
    variables?: Record<string, unknown>,
  ): string | null {
    const idArg = field.arguments?.find(
      (arg) => arg.name.value === 'id' || arg.name.value === 'filter',
    );

    if (!idArg) {
      return null;
    }

    if (idArg.value.kind === 'Variable') {
      const variableNode = idArg.value as VariableNode;
      const variableValue = variables?.[variableNode.name.value];

      if (typeof variableValue === 'string') {
        return variableValue;
      }

      if (
        typeof variableValue === 'object' &&
        variableValue !== null &&
        'id' in variableValue
      ) {
        const idFilter = (variableValue as { id?: { eq?: string } }).id;

        if (idFilter?.eq) {
          return idFilter.eq;
        }
      }
    }

    if (idArg.value.kind === 'StringValue') {
      return idArg.value.value;
    }

    return null;
  }

  private extractFieldNames(selectionSet?: SelectionSetNode): string[] {
    if (!selectionSet) {
      return [];
    }

    return selectionSet.selections
      .filter((sel): sel is FieldNode => sel.kind === 'Field')
      .map((field) => field.name.value)
      .filter(isDefined);
  }
}

