import { DeleteQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-query.factory';
import { CreateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-query.factory';
import { UpdateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/get-variables.factory';
import { LastCursorParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/last-cursor-parser.factory';
import { LimitParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/limit-parser.factory';
import { OrderByParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/order-by-parser.factory';
import { FilterParserFactory } from 'src/core/api-rest/api-rest-query-builder/factories/parsers/filter-parser.factory';

export const apiRestQueryBuilderFactories = [
  DeleteQueryFactory,
  CreateQueryFactory,
  UpdateQueryFactory,
  FindOneQueryFactory,
  FindManyQueryFactory,
  DeleteVariablesFactory,
  CreateVariablesFactory,
  UpdateVariablesFactory,
  GetVariablesFactory,
  LastCursorParserFactory,
  LimitParserFactory,
  OrderByParserFactory,
  FilterParserFactory,
];
