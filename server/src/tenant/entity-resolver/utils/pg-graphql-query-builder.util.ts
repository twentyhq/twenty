import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { pascalCase } from 'src/utils/pascal-case';

import { stringifyWithoutKeyQuote } from './stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from './convert-fields-to-graphql.util';

type Command = 'findMany' | 'findOne' | 'createMany' | 'updateOne';

type CommandArgs = {
  findMany: null;
  findOne: { id: string };
  createMany: { data: any[] };
  updateOne: { id: string; data: any };
};

export interface PGGraphQLQueryBuilderOptions {
  entityName: string;
  tableName: string;
  info: GraphQLResolveInfo;
  fieldAliases: Record<string, string>;
}

export class PGGraphQLQueryBuilder {
  private options: PGGraphQLQueryBuilderOptions;
  private command: Command;
  private commandArgs: any;

  constructor(options: PGGraphQLQueryBuilderOptions) {
    this.options = options;
  }

  private getFields(): string {
    const fields = graphqlFields(this.options.info);

    return convertFieldsToGraphQL(fields, this.options.fieldAliases);
  }

  // Define command setters
  findMany() {
    this.command = 'findMany';
    this.commandArgs = null;
    return this;
  }

  findOne(args: CommandArgs['findOne']) {
    this.command = 'findOne';
    this.commandArgs = args;
    return this;
  }

  createMany(args: CommandArgs['createMany']) {
    this.command = 'createMany';
    this.commandArgs = args;
    return this;
  }

  updateOne(args: CommandArgs['updateOne']) {
    this.command = 'updateOne';
    this.commandArgs = args;
    return this;
  }

  build() {
    const { entityName, tableName } = this.options;
    const fields = this.getFields();

    switch (this.command) {
      case 'findMany':
        return `
          query FindMany${pascalCase(entityName)} {
            findMany${pascalCase(entityName)}: ${tableName}Collection {
              ${fields}
            }
          }
        `;
      case 'findOne':
        return `
          query FindOne${pascalCase(entityName)} {
            findOne${pascalCase(
              entityName,
            )}: ${tableName}Collection(filter: { id: { eq: "${
          this.commandArgs.id
        }" } }) {
              ${fields}
            }
          }
        `;
      case 'createMany':
        return `
          mutation CreateMany${pascalCase(entityName)} {
            createMany${pascalCase(
              entityName,
            )}: insertInto${tableName}Collection(objects: ${stringifyWithoutKeyQuote(
          this.commandArgs.data.map((datum) => ({
            id: uuidv4(),
            ...datum,
          })),
        )}) {
              affectedCount
              records {
                ${fields}
              }
            }
          }
        `;
      case 'updateOne':
        return `
          mutation UpdateOne${pascalCase(entityName)} {
            updateOne${pascalCase(
              entityName,
            )}: update${tableName}Collection(set: ${stringifyWithoutKeyQuote(
          this.commandArgs.data,
        )}, filter: { id: { eq: "${this.commandArgs.id}" } }) {
              affectedCount
              records {
                ${fields}
              }
            }
          }
        `;
      default:
        throw new Error('Invalid command');
    }
  }
}
