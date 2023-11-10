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

  constructor(
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly updateOneQueryFactory: UpdateOneQueryFactory,
    private readonly deleteOneQueryFactory: DeleteOneQueryFactory,
  ) {}

  findMany<
    Filter extends RecordFilter = RecordFilter,
    OrderBy extends RecordOrderBy = RecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: QueryBuilderOptions,
  ): string {
    return this.findManyQueryFactory.create<Filter, OrderBy>(args, options);
  }

  findOne<Filter extends RecordFilter = RecordFilter>(
    args: FindOneResolverArgs<Filter>,
    options: QueryBuilderOptions,
  ): string {
    return this.findOneQueryFactory.create<Filter>(args, options);
  }

  createMany<Record extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Record>,
    options: QueryBuilderOptions,
  ): string {
    return this.createManyQueryFactory.create<Record>(args, options);
  }

  updateOne<Record extends IRecord = IRecord>(
    initialArgs: UpdateOneResolverArgs<Record>,
    options: QueryBuilderOptions,
  ): string {
    return this.updateOneQueryFactory.create<Record>(initialArgs, options);
  }

  deleteOne(args: DeleteOneResolverArgs, options: QueryBuilderOptions): string {
    return this.deleteOneQueryFactory.create(args, options);
  }
}
