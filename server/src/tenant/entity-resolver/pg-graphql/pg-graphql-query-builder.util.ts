import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';
import { stringifyWithoutKeyQuote } from 'src/tenant/entity-resolver/utils/stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from 'src/tenant/entity-resolver/utils/convert-fields-to-graphql.util';
import { convertArguments } from 'src/tenant/entity-resolver/utils/convert-arguments.util';

type CommandArgs = {
  findMany: null;
  findOne: { id: string };
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
  findMany() {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      query {
        ${tableName}Collection {
          ${fieldsString}
        }
      }
    `;
  }

  findOne({ id }: CommandArgs['findOne']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      query {
        ${tableName}Collection(filter: { id: { eq: "${id}" } }) {
          ${fieldsString}
        }
      }
    `;
  }

  createMany({ data }: CommandArgs['createMany']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(data, this.options.fields);

    return `
      mutation {
        insertInto${tableName}Collection(objects: ${stringifyWithoutKeyQuote(
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

  updateOne({ id, data }: CommandArgs['updateOne']) {
    const { tableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(data, this.options.fields);

    return `
      mutation {
        update${tableName}Collection(set: ${stringifyWithoutKeyQuote(
      args,
    )}, filter: { id: { eq: "${id}" } }) {
          affectedCount
          records {
            ${fieldsString}
          }
        }
      }
    `;
  }
}
