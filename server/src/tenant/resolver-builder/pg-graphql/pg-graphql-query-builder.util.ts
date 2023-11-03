import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { v4 as uuidv4 } from 'uuid';

import { FieldMetadataInterface } from 'src/tenant/schema-builder/interfaces/field-metadata.interface';
import {
  CreateManyResolverArgs,
  DeleteOneResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateOneResolverArgs,
} from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/tenant/resolver-builder/interfaces/record.interface';

import { stringifyWithoutKeyQuote } from 'src/tenant/resolver-builder/utils/stringify-without-key-quote.util';
import { convertFieldsToGraphQL } from 'src/tenant/resolver-builder/utils/convert-fields-to-graphql.util';
import { convertArguments } from 'src/tenant/resolver-builder/utils/convert-arguments.util';
import { generateArgsInput } from 'src/tenant/resolver-builder/utils/generate-args-input.util';

export interface PGGraphQLQueryBuilderOptions {
  targetTableName: string;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
}

export class PGGraphQLQueryBuilder<
  Record extends IRecord = IRecord,
  Filter extends RecordFilter = RecordFilter,
  OrderBy extends RecordOrderBy = RecordOrderBy,
> {
  private options: PGGraphQLQueryBuilderOptions;

  constructor(options: PGGraphQLQueryBuilderOptions) {
    this.options = options;
  }

  private getFieldsString(): string {
    const select = graphqlFields(this.options.info);

    return convertFieldsToGraphQL(select, this.options.fieldMetadataCollection);
  }

  findMany(args?: FindManyResolverArgs<Filter, OrderBy>): string {
    const { targetTableName } = this.options;
    const fieldsString = this.getFieldsString();
    const convertedArgs = convertArguments(
      args,
      this.options.fieldMetadataCollection,
    );
    const argsString = generateArgsInput(convertedArgs);

    return `
      query {
        ${targetTableName}Collection${argsString ? `(${argsString})` : ''} {
          ${fieldsString}
        }
      }
    `;
  }

  findOne(args: FindOneResolverArgs<Filter>): string {
    const { targetTableName } = this.options;
    const fieldsString = this.getFieldsString();
    const convertedArgs = convertArguments(
      args,
      this.options.fieldMetadataCollection,
    );
    const argsString = generateArgsInput(convertedArgs);

    return `
      query {
        ${targetTableName}Collection${argsString ? `(${argsString})` : ''} {
          edges {
            node {
              ${fieldsString}
            }
          }
        }
      }
    `;
  }

  createMany(initialArgs: CreateManyResolverArgs<Record>): string {
    const { targetTableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(
      initialArgs,
      this.options.fieldMetadataCollection,
    );

    return `
      mutation {
        insertInto${targetTableName}Collection(objects: ${stringifyWithoutKeyQuote(
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

  updateOne(initialArgs: UpdateOneResolverArgs<Record>): string {
    const { targetTableName } = this.options;
    const fieldsString = this.getFieldsString();
    const args = convertArguments(
      initialArgs,
      this.options.fieldMetadataCollection,
    );

    return `
      mutation {
        update${targetTableName}Collection(set: ${stringifyWithoutKeyQuote(
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

  deleteOne(args: DeleteOneResolverArgs): string {
    const { targetTableName } = this.options;
    const fieldsString = this.getFieldsString();

    return `
      mutation {
        deleteFrom${targetTableName}Collection(filter: { id: { eq: "${args.id}" } }) {
        affectedCount
        records {
          ${fieldsString}
        }
      }
    }
  `;
  }
}
