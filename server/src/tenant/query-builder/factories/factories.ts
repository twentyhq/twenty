import { ArgsAliasFactory } from './args-alias.factory';
import { ArgsStringFactory } from './args-string.factory';
import { CompositeFieldAliasFactory } from './composite-field-alias.factory';
import { CreateManyQueryFactory } from './create-many-query.factory';
import { DeleteOneQueryFactory } from './delete-one-query.factory';
import { FieldAliasFacotry } from './field-alias.factory';
import { FieldsStringFactory } from './fields-string.factory';
import { FindManyQueryFactory } from './find-many-query.factory';
import { FindOneQueryFactory } from './find-one-query.factory';
import { UpdateOneQueryFactory } from './update-one-query.factory';

export const queryBuilderFactories = [
  ArgsAliasFactory,
  ArgsStringFactory,
  CompositeFieldAliasFactory,
  CreateManyQueryFactory,
  DeleteOneQueryFactory,
  FieldAliasFacotry,
  FieldsStringFactory,
  FindManyQueryFactory,
  FindOneQueryFactory,
  UpdateOneQueryFactory,
];
