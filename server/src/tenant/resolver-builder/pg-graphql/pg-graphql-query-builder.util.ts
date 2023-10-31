import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { stringifyWithoutKeyQuote } from 'src/tenant/resolver-builder/utils/stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from 'src/tenant/resolver-builder/utils/convert-fields-to-graphql.util';
import { convertArguments } from 'src/tenant/resolver-builder/utils/convert-arguments.util';
import { generateArgsInput } from 'src/tenant/resolver-builder/utils/generate-args-input.util';

type CommandArgs = {
  findMany: {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
    filter?: any;
  };
  findOne: { filter?: any };
  createMany: { data: any[] };
  updateOne: { id: string; data: any };
  deleteOne: { id: string };
};

export interface PGGraphQLQueryBuilderOptions {
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
    console.log('1.1');
    const select = graphqlFields(this.options.info);

    console.log('1.2: ', select);

    return convertFieldsToGraphQL(select, this.options.fields);
  }

  // Define command setters
  findMany(args?: CommandArgs['findMany']) {
    console.log('args', args);
    const { tableName } = this.options;
    console.log('1');
    const fieldsString = this.getFieldsString();
    console.log('2');
    const convertedArgs = convertArguments(args, this.options.fields);
    console.log('3');
    const argsString = generateArgsInput(convertedArgs);
    console.log('4');

    return `
      query {
        ${tableName}Collection${argsString ? `(${argsString})` : ''} {
          ${fieldsString}
        }
      }
    `;
  }

  findOne(args: CommandArgs['findOne']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const convertedArgs = convertArguments(args, this.options.fields);
    const argsString = generateArgsInput(convertedArgs);

    return `
      query {
        ${tableName}Collection${argsString ? `(${argsString})` : ''} {
          edges {
            node {
              ${fieldsString}
            }
          }
        }
      }
    `;
  }

  createMany(initialArgs: CommandArgs['createMany']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(initialArgs, this.options.fields);

    return `
      mutation {
        insertInto${tableName}Collection(objects: ${stringifyWithoutKeyQuote(
      args.data.map((datum) => ({
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

  updateOne(initialArgs: CommandArgs['updateOne']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(initialArgs, this.options.fields);

    return `
      mutation {
        update${tableName}Collection(set: ${stringifyWithoutKeyQuote(
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

  deleteOne(args: CommandArgs['deleteOne']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      mutation {
        deleteFrom${tableName}Collection(filter: { id: { eq: "${args.id}" } }) {
        affectedCount
        records {
          ${fieldsString}
        }
      }
    }
  `;
  }
}
