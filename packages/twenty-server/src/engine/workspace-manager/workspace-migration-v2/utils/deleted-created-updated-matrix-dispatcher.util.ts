import { FromTo } from 'twenty-shared/types';

export type DeletedCreatedUpdatedMatrix<T> = {
  created: T[];
  deleted: T[];
  updated: FromTo<T>[];
};

export type CustomDeletedCreatedUpdatedMatrix<TLabel extends string, TInput> = {
  [P in keyof DeletedCreatedUpdatedMatrix<TInput> as `${P}${Capitalize<TLabel>}`]: DeletedCreatedUpdatedMatrix<TInput>[P];
};

export type UniqueIdentifierItem = {
  uniqueIdentifier: string;
};

export const deletedCreatedUpdatedMatrixDispatcher = <
  T extends UniqueIdentifierItem,
>({
  from,
  to,
}: FromTo<T[]>): DeletedCreatedUpdatedMatrix<T> => {
  const initialDispatcher: DeletedCreatedUpdatedMatrix<T> = {
    created: [],
    updated: [],
    deleted: [],
  };

  const fromMap = new Map(from.map((obj) => [obj.uniqueIdentifier, obj]));
  const toMap = new Map(to.map((obj) => [obj.uniqueIdentifier, obj]));

  for (const [identifier, fromObj] of fromMap) {
    if (!toMap.has(identifier)) {
      initialDispatcher.deleted.push(fromObj);
    }
  }

  for (const [identifier, toObj] of toMap) {
    if (!fromMap.has(identifier)) {
      initialDispatcher.created.push(toObj);
    }
  }

  for (const [identifier, fromObj] of fromMap) {
    const toObj = toMap.get(identifier);

    if (toObj) {
      initialDispatcher.updated.push({
        from: fromObj,
        to: toObj,
      });
    }
  }

  return initialDispatcher;
};
