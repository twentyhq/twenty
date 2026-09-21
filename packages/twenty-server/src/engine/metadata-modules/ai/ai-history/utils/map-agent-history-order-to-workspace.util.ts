import { isDefined } from 'twenty-shared/utils';

import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type OrderByValueLike } from 'src/engine/twenty-orm/query-builder/types/query-builder.type';
import { type WorkspaceFindOptionsOrder } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

const mapOrderValue = (value: unknown): OrderByValueLike => {
  const direction =
    typeof value === 'object' && isDefined(value) && 'direction' in value
      ? value.direction
      : typeof value === 'object'
        ? undefined
        : value;
  const nulls =
    typeof value === 'object' && isDefined(value) && 'nulls' in value
      ? value.nulls
      : undefined;

  if (
    isDefined(direction) &&
    !['ASC', 'DESC', 'asc', 'desc', 1, -1].includes(
      direction as string | number,
    )
  ) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Invalid history sort direction',
    );
  }
  if (
    isDefined(nulls) &&
    !['FIRST', 'LAST', 'first', 'last'].includes(nulls as string)
  ) {
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

export const mapAgentHistoryOrderToWorkspace = (
  objectName: AgentHistoryObjectName,
  order: Record<string, unknown> | undefined,
): WorkspaceFindOptionsOrder | undefined => {
  if (!isDefined(order)) {
    return undefined;
  }

  // TypeORM find options use direction/LAST; the workspace ORM uses order/NULLS LAST.
  return Object.fromEntries(
    Object.entries(order)
      .filter(([, value]) => isDefined(value))
      .map(([fieldName, value]) => [
        objectName === 'agentChatThread' && fieldName === 'deletedAt'
          ? 'archivedAt'
          : fieldName,
        typeof value === 'object' &&
        isDefined(value) &&
        Object.keys(value).some((key) => key !== 'direction' && key !== 'nulls')
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
