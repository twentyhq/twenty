import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager, type ObjectLiteral } from 'typeorm';

import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentChatThreadOwnerFields } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-fields.util';
import { resolveAgentChatThreadOwners } from 'src/engine/metadata-modules/ai/ai-history/utils/resolve-agent-chat-thread-owners.util';
import { type WorkspaceFindOptions } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';

type OwnerMappingContext = {
  manager: EntityManager;
  workspaceId: string;
  ownerFields: AgentChatThreadOwnerFields;
};

const readOwnerUserWorkspaceId = (clause: ObjectLiteral): string => {
  const userWorkspaceId = clause.userWorkspaceId;

  if (!isNonEmptyString(userWorkspaceId)) {
    throw new AgentHistoryStorageException(
      'INVALID_CRITERIA',
      'Chat thread owner criteria must be a single user workspace ID',
    );
  }

  return userWorkspaceId;
};

// Returns null when no clause can match: the membership has no member left.
export const mapAgentChatThreadOwnerWhereToWorkspace = async ({
  where,
  manager,
  workspaceId,
  ownerFields,
}: OwnerMappingContext & {
  where: WorkspaceFindOptions['where'];
}): Promise<WorkspaceFindOptions['where'] | null> => {
  if (!isDefined(where) || ownerFields.hasUserWorkspaceIdField) {
    return where;
  }

  const clauses: ObjectLiteral[] = Array.isArray(where) ? where : [where];
  const ownedClauses = clauses.filter((clause) => 'userWorkspaceId' in clause);

  if (ownedClauses.length === 0) {
    return where;
  }

  const workspaceMemberIdByUserWorkspaceId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'userWorkspaceId',
      ids: ownedClauses.map(readOwnerUserWorkspaceId),
    },
  );

  const mappedClauses = clauses.flatMap((clause) => {
    if (!('userWorkspaceId' in clause)) {
      return [clause];
    }

    const { userWorkspaceId, ...rest } = clause;
    const workspaceMemberId =
      workspaceMemberIdByUserWorkspaceId.get(userWorkspaceId);

    return isDefined(workspaceMemberId) ? [{ ...rest, workspaceMemberId }] : [];
  });

  if (mappedClauses.length === 0) {
    return null;
  }

  return Array.isArray(where) ? mappedClauses : mappedClauses[0];
};

export const mapAgentChatThreadOwnerValuesToWorkspace = async ({
  values,
  manager,
  workspaceId,
  ownerFields,
}: OwnerMappingContext & {
  values: ObjectLiteral | ObjectLiteral[];
}): Promise<ObjectLiteral | ObjectLiteral[]> => {
  const records = Array.isArray(values) ? values : [values];
  const ownedRecords = records.filter((record) => 'userWorkspaceId' in record);

  if (ownedRecords.length === 0 || !ownerFields.hasWorkspaceMemberField) {
    return values;
  }

  const workspaceMemberIdByUserWorkspaceId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'userWorkspaceId',
      ids: ownedRecords.map(readOwnerUserWorkspaceId),
    },
  );

  const mappedRecords = records.map((record) => {
    if (!('userWorkspaceId' in record)) {
      return record;
    }

    const { userWorkspaceId, ...rest } = record;
    const workspaceMemberId =
      workspaceMemberIdByUserWorkspaceId.get(userWorkspaceId);

    if (!isDefined(workspaceMemberId)) {
      throw new AgentHistoryStorageException(
        'INVALID_CRITERIA',
        'Chat thread owner is not a member of this workspace',
      );
    }

    // Both columns exist only while the upgrade command runs; keep the legacy
    // column complete so it stays authoritative until it is dropped.
    return ownerFields.hasUserWorkspaceIdField
      ? { ...rest, userWorkspaceId, workspaceMemberId }
      : { ...rest, workspaceMemberId };
  });

  return Array.isArray(values) ? mappedRecords : mappedRecords[0];
};

export const mapAgentChatThreadOwnerSelectToWorkspace = ({
  select,
  ownerFields,
}: {
  select: WorkspaceFindOptions['select'];
  ownerFields: AgentChatThreadOwnerFields;
}): WorkspaceFindOptions['select'] => {
  if (!isDefined(select) || ownerFields.hasUserWorkspaceIdField) {
    return select;
  }

  if (Array.isArray(select)) {
    return select.map((fieldName) =>
      fieldName === 'userWorkspaceId' ? 'workspaceMemberId' : fieldName,
    );
  }

  return Object.fromEntries(
    Object.entries(select).map(([fieldName, value]) => [
      fieldName === 'userWorkspaceId' ? 'workspaceMemberId' : fieldName,
      value,
    ]),
  );
};

export const hydrateAgentChatThreadOwners = async ({
  records,
  manager,
  workspaceId,
  ownerFields,
}: OwnerMappingContext & {
  records: ObjectLiteral[];
}): Promise<void> => {
  if (ownerFields.hasUserWorkspaceIdField) {
    return;
  }

  const ownedRecords = records.filter((record) =>
    isNonEmptyString(record.workspaceMemberId),
  );

  const userWorkspaceIdByWorkspaceMemberId = await resolveAgentChatThreadOwners(
    {
      manager,
      workspaceId,
      from: 'workspaceMemberId',
      ids: ownedRecords.map((record) => record.workspaceMemberId),
    },
  );

  for (const record of ownedRecords) {
    record.userWorkspaceId =
      userWorkspaceIdByWorkspaceMemberId.get(record.workspaceMemberId) ?? null;
  }
};
