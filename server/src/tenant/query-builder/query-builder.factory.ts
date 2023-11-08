import { Injectable, Logger } from '@nestjs/common';

import { QueryBuilderOptions } from 'src/tenant/query-builder/interfaces/query-builder-options.interface';
import {
  Record as IRecord,
  RecordFilter,
  RecordOrderBy,
} from 'src/tenant/query-builder/interfaces/record.interface';
import {
  FindManyResolverArgs,
  FindOneResolverArgs,
  CreateManyResolverArgs,
  UpdateOneResolverArgs,
  DeleteOneResolverArgs,
} from 'src/tenant/query-builder/interfaces/resolvers-builder.interface';

import { FindManyQueryFactory } from './factories/find-many-query.factory';
import { FindOneQueryFactory } from './factories/find-one-query.factory';
import { CreateManyQueryFactory } from './factories/create-many-query.factory';
import { UpdateOneQueryFactory } from './factories/update-one-query.factory';
import { DeleteOneQueryFactory } from './factories/delete-one-query.factory';

@Injectable()
export class QueryBuilderFactory {
  private readonly logger = new Logger(QueryBuilderFactory.name);
  private queryBuilderOptions: QueryBuilderOptions;

  constructor(
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly updateOneQueryFactory: UpdateOneQueryFactory,
    private readonly deleteOneQueryFactory: DeleteOneQueryFactory,
  ) {}

  create(options: QueryBuilderOptions): this {
    this.queryBuilderOptions = options;
    return this;
  }

  findMany<
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(args: FindManyResolverArgs<Filter, OrderBy>): string {
    if (!this.queryBuilderOptions) {
      throw new Error(
        'Query builder need to be created first, please call create method',
      );
    }

    return this.findManyQueryFactory.create<Filter, OrderBy>(
      args,
      this.queryBuilderOptions,
    );
  }

  findOne<Filter extends RecordFilter = RecordFilter>(
    args: FindOneResolverArgs<Filter>,
  ): string {
    if (!this.queryBuilderOptions) {
      throw new Error(
        'Query builder need to be created first, please call create method',
      );
    }

    return this.findOneQueryFactory.create<Filter>(
      args,
      this.queryBuilderOptions,
    );
  }

  createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
  ): string {
    if (!this.queryBuilderOptions) {
      throw new Error(
        'Query builder need to be created first, please call create method',
      );
    }

    return this.createManyQueryFactory.create<Record>(
      args,
      this.queryBuilderOptions,
    );
  }

  updateOne<Record extends IRecord = IRecord>(
    initialArgs: UpdateOneResolverArgs<Record>,
  ): string {
    if (!this.queryBuilderOptions) {
      throw new Error(
        'Query builder need to be created first, please call create method',
      );
    }

    return this.updateOneQueryFactory.create<Record>(
      initialArgs,
      this.queryBuilderOptions,
    );
  }

  deleteOne(args: DeleteOneResolverArgs): string {
    if (!this.queryBuilderOptions) {
      throw new Error(
        'Query builder need to be created first, please call create method',
      );
    }

    return this.deleteOneQueryFactory.create(args, this.queryBuilderOptions);
  }
}
