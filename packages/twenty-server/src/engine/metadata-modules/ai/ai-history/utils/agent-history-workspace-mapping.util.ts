import { isDefined } from 'twenty-shared/utils';
import { mapAgentHistoryFieldNameToWorkspace } from 'src/engine/metadata-modules/ai/ai-history/utils/map-agent-history-field-name-to-workspace.util';
import {
  type FindManyOptions,
  type FindOptionsWhere,
  type ObjectLiteral,
} from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { type WorkspaceFindOptions } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';

export function mapAgentHistoryValuesToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  values: QueryDeepPartialEntity<TRecord>,
): ObjectLiteral;
export function mapAgentHistoryValuesToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  values: QueryDeepPartialEntity<TRecord>[],
): ObjectLiteral[];
export function mapAgentHistoryValuesToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
): ObjectLiteral | ObjectLiteral[];
export function mapAgentHistoryValuesToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  values: QueryDeepPartialEntity<TRecord> | QueryDeepPartialEntity<TRecord>[],
): ObjectLiteral | ObjectLiteral[] {
  if (Array.isArray(values)) {
    return values.map((value) =>
      mapAgentHistoryValuesToWorkspace<TRecord>(objectName, value),
    );
  }
  const { workspaceId: _workspaceId, ...fields }: ObjectLiteral = { ...values };
  return Object.fromEntries(
    Object.entries(fields).map(([fieldName, value]) => [
      mapAgentHistoryFieldNameToWorkspace(objectName, fieldName),
      value,
    ]),
  );
}

export function mapAgentHistoryWhereToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  where: FindOptionsWhere<TRecord>,
): ObjectLiteral;
export function mapAgentHistoryWhereToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  where: FindManyOptions<TRecord>['where'],
): WorkspaceFindOptions['where'];
export function mapAgentHistoryWhereToWorkspace<
  TRecord extends { id: string; workspaceId: string },
>(
  objectName: AgentHistoryObjectName,
  where: FindManyOptions<TRecord>['where'],
): WorkspaceFindOptions['where'] {
  if (!where) {
    return undefined;
  }
  if (Array.isArray(where)) {
    return where.map((clause) =>
      mapAgentHistoryWhereToWorkspace<TRecord>(objectName, clause),
    );
  }
  if ('workspaceId' in where) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Pass workspaceId separately from history query criteria',
    );
  }
  return Object.fromEntries(
    Object.entries(where).map(([fieldName, value]) => [
      mapAgentHistoryFieldNameToWorkspace(objectName, fieldName),
      value,
    ]),
  );
}

export const mapAgentHistorySelectToWorkspace = <TRecord>(
  objectName: AgentHistoryObjectName,
  select: FindManyOptions<TRecord>['select'],
): WorkspaceFindOptions['select'] => {
  if (!isDefined(select)) {
    return undefined;
  }
  if (Array.isArray(select)) {
    return select.map((fieldName) =>
      mapAgentHistoryFieldNameToWorkspace(objectName, String(fieldName)),
    );
  }

  return Object.fromEntries(
    Object.entries(select).map(([fieldName, value]) => {
      if (value !== undefined && typeof value !== 'boolean') {
        throw new AgentHistoryStorageException(
          'INVALID_CRITERIA',
          'History field selections must be boolean',
        );
      }
      return [
        mapAgentHistoryFieldNameToWorkspace(objectName, fieldName),
        value === true,
      ];
    }),
  );
};
