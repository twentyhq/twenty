import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export type ServerlessFunctionDtoFromFlat = Omit<
  FlatServerlessFunction,
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'cronTriggerIds'
  | 'databaseEventTriggerIds'
  | 'routeTriggerIds'
  | 'code'
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const fromFlatServerlessFunctionToServerlessFunctionDto = (
  flatServerlessFunction: FlatServerlessFunction,
): ServerlessFunctionDtoFromFlat => {
  const {
    createdAt,
    updatedAt,
    deletedAt,
    cronTriggerIds: _cronTriggerIds,
    databaseEventTriggerIds: _databaseEventTriggerIds,
    routeTriggerIds: _routeTriggerIds,
    code: _code,
    ...rest
  } = flatServerlessFunction;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
