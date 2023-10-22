import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { stringifyWithoutKeyQuote } from 'src/tenant/entity-resolver/utils/stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from 'src/tenant/entity-resolver/utils/convert-fields-to-graphql.util';
import { convertArguments } from 'src/tenant/entity-resolver/utils/convert-arguments.util';
import { generateArgsInput } from 'src/tenant/entity-resolver/utils/generate-args-input.util';

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
    const select = graphqlFields(this.options.info);

    return convertFieldsToGraphQL(select, this.options.fields);
  }

  // Define command setters
  findMany(args?: CommandArgs['findMany']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const convertedArgs = convertArguments(args, this.options.fields);
    const argsString = generateArgsInput(convertedArgs);

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
}
