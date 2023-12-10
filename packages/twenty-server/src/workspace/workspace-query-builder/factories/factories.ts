import { ArgsAliasFactory } from './args-alias.factory';
import { ArgsStringFactory } from './args-string.factory';
import { RelationFieldAliasFactory } from './relation-field-alias.factory';
import { CreateManyQueryFactory } from './create-many-query.factory';
import { DeleteOneQueryFactory } from './delete-one-query.factory';
import { FieldAliasFacotry } from './field-alias.factory';
import { FieldsStringFactory } from './fields-string.factory';
import { FindManyQueryFactory } from './find-many-query.factory';
import { FindOneQueryFactory } from './find-one-query.factory';
import { UpdateOneQueryFactory } from './update-one-query.factory';
import { UpdateManyQueryFactory } from './update-many-query.factory';
import { DeleteManyQueryFactory } from './delete-many-query.factory';

export const workspaceQueryBuilderFactories = [
  ArgsAliasFactory,
  ArgsStringFactory,
  RelationFieldAliasFactory,
  CreateManyQueryFactory,
  DeleteOneQueryFactory,
  FieldAliasFacotry,
  FieldsStringFactory,
  FindManyQueryFactory,
  FindOneQueryFactory,
  UpdateOneQueryFactory,
  UpdateManyQueryFactory,
  DeleteManyQueryFactory,
];
