import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';

export type DeleledCreatedUpdatedMatrix<T> = {
  created: T[];
  deleted: T[];
  updated: FromTo<T>[];
};

export type CustomDeletedCreatedUpdatedMatrix<TLabel extends string, TInput> = {
  [P in keyof DeleledCreatedUpdatedMatrix<TInput> as `${P}${Capitalize<TLabel>}`]: DeleledCreatedUpdatedMatrix<TInput>[P];
};

export type UniqueIdentifierItem = {
  uniqueIdentifier: string;
};

export const deletedCreatedUpdatedMatrixDispatcher = <
  T extends UniqueIdentifierItem,
>({
  from,
  to,
}: FromTo<T[]>): DeleledCreatedUpdatedMatrix<T> => {
  const initialDispatcher: DeleledCreatedUpdatedMatrix<T> = {
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
