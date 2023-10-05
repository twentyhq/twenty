import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import { pascalCase } from 'src/utils/pascal-case';

import { convertFieldsToGraphQL } from './entity-resolver.util';

export class QueryBuilder {
  entityName: string;
  tableName: string;
  info: GraphQLResolveInfo;
  fieldAliases: Record<string, string>;

  constructor({
    entityName,
    tableName,
    info,
    fieldAliases,
  }: {
    entityName: string;
    tableName: string;
    info: GraphQLResolveInfo;
    fieldAliases: Record<string, string>;
  }) {
    this.entityName = entityName;
    this.tableName = tableName;
    this.info = info;
    this.fieldAliases = fieldAliases;
  }

  private getFields(): string {
    // This can utilize any function you already have like 'convertFieldsToGraphQL' to convert fields based on GraphQL resolve info
    const fields = graphqlFields(this.info);
    return convertFieldsToGraphQL(fields, this.fieldAliases);
  }

  create(strings: TemplateStringsArray, ...expressions: Function[]): string {
    const queryName = expressions[0](this.queryName.bind(this));
    const commandName = expressions[1](this.commandName.bind(this));
    const fields = expressions[2](this.getFields.bind(this));

    return (
      strings[0] +
      queryName +
      strings[1] +
      commandName +
      strings[2] +
      fields +
      strings[3]
    );
  }

  queryName(): string {
    return `findAll${pascalCase(this.entityName)}`;
  }

  commandName(): string {
    return `${this.tableName}Collection`;
  }
}
