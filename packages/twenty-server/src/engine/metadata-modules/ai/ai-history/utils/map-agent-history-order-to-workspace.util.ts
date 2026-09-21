import { isDefined } from 'twenty-shared/utils';
import { isObject } from '@sniptt/guards';
import { type FindOptionsOrder, type FindOptionsOrderValue } from 'typeorm';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type OrderByValueLike } from 'src/engine/twenty-orm/query-builder/types/query-builder.type';
import { type WorkspaceFindOptionsOrder } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

type HistoryOrderValue =
  | FindOptionsOrderValue
  | Record<string, FindOptionsOrderValue>;

const isRelationOrder = (
  value: HistoryOrderValue,
): value is Record<string, FindOptionsOrderValue> =>
  isObject(value) &&
  Object.keys(value).some((key) => key !== 'direction' && key !== 'nulls');

const mapOrderValue = (value: FindOptionsOrderValue): OrderByValueLike => {
  const direction = isObject(value) ? value.direction : value;
  const nulls = isObject(value) ? value.nulls : undefined;

  if (
    isDefined(direction) &&
    !['ASC', 'DESC', 'asc', 'desc', 1, -1].includes(direction)
  ) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Invalid history sort direction',
    );
  }
  if (isDefined(nulls) && !['FIRST', 'LAST', 'first', 'last'].includes(nulls)) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Invalid history null ordering',
    );
  }

  return {
    order:
      direction === -1 || direction === 'DESC' || direction === 'desc'
        ? 'DESC'
        : 'ASC',
    ...(isDefined(nulls)
      ? {
          nulls:
            nulls === 'FIRST' || nulls === 'first'
              ? 'NULLS FIRST'
              : 'NULLS LAST',
        }
      : {}),
  };
};

export const mapAgentHistoryOrderToWorkspace = <TRecord>(
  objectName: AgentHistoryObjectName,
  order: FindOptionsOrder<TRecord> | undefined,
): WorkspaceFindOptionsOrder | undefined => {
  if (!isDefined(order)) {
    return undefined;
  }

  const entries: [string, HistoryOrderValue | undefined][] =
    Object.entries(order);

  // TypeORM find options use direction/LAST; the workspace ORM uses order/NULLS LAST.
  return Object.fromEntries(
    entries
      .filter((entry): entry is [string, HistoryOrderValue] =>
        isDefined(entry[1]),
      )
      .map(([fieldName, value]) => [
        objectName === 'agentChatThread' && fieldName === 'deletedAt'
          ? 'archivedAt'
          : fieldName,
        isRelationOrder(value)
          ? Object.fromEntries(
              Object.entries(value).map(
                ([relationFieldName, relationOrder]) => [
                  relationFieldName,
                  mapOrderValue(relationOrder),
                ],
              ),
            )
          : mapOrderValue(value),
      ]),
  );
};
