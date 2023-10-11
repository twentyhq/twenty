import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';
import isEmpty from 'lodash.isempty';

import { pascalCase } from 'src/utils/pascal-case';
import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

import { stringifyWithoutKeyQuote } from './stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from './convert-fields-to-graphql.util';

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
  fields: FieldMetadata[];
}

export class PGGraphQLQueryBuilder {
  private options: PGGraphQLQueryBuilderOptions;

  constructor(options: PGGraphQLQueryBuilderOptions) {
    this.options = options;
  }

  private getFieldsString(): string {
    const select = graphqlFields(this.options.info);

    return convertFieldsToGraphQL(select, this.options.fields);
  }

  private getArguments(args: any): any {
    const fieldsMap = new Map(
      this.options.fields.map((metadata) => [metadata.displayName, metadata]),
    );

    if (Array.isArray(args)) {
      return args.map((arg) => this.getArguments(arg));
    }

    for (const [key, value] of Object.entries(args)) {
      if (fieldsMap.has(key) && typeof value === 'object' && !isEmpty(value)) {
        const fieldMetadata = fieldsMap.get(key)!;

        for (const [subKey, subValue] of Object.entries(value)) {
          args[fieldMetadata.targetColumnMap[subKey]] = subValue;
        }

        delete args[key];
      }
    }

    return args;
  }

  // Define command setters
  findMany() {
    const { entityName, tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      query FindMany${pascalCase(entityName)} {
        findMany${pascalCase(entityName)}: ${tableName}Collection {
          ${fieldsString}
        }
      }
    `;
  }

  findOne(args: CommandArgs['findOne']) {
    const { entityName, tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      query FindOne${pascalCase(entityName)} {
        findOne${pascalCase(
          entityName,
        )}: ${tableName}Collection(filter: { id: { eq: "${args.id}" } }) {
          ${fieldsString}
        }
      }
    `;
  }

  createMany(initialArgs: CommandArgs['createMany']) {
    const { entityName, tableName } = this.options;
    const fieldsString = this.getFieldsString();
    console.log('INITIAL ARGS: ', initialArgs);
    const args = this.getArguments(initialArgs.data);
    console.log('RESULT ARGS: ', args);

    return `
      mutation CreateMany${pascalCase(entityName)} {
        createMany${pascalCase(
          entityName,
        )}: insertInto${tableName}Collection(objects: ${stringifyWithoutKeyQuote(
      args.map((datum) => ({
        id: uuidv4(),
        ...datum,
      })),
    )}) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }

  updateOne(args: CommandArgs['updateOne']) {
    const { entityName, tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      mutation UpdateOne${pascalCase(entityName)} {
        updateOne${pascalCase(
          entityName,
        )}: update${tableName}Collection(set: ${stringifyWithoutKeyQuote(
      args.data,
    )}, filter: { id: { eq: "${args.id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
