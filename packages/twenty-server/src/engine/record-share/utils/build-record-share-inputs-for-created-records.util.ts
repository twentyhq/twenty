import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { type ShareWithInput } from 'src/engine/record-share/types/share-with-input.type';
import { resolveShareWithPrincipal } from 'src/engine/record-share/utils/resolve-share-with-principal.util';

type RecordShareInputForRecord = Omit<
  RecordShareInput,
  'recordId' | 'objectMetadataId'
>;

const resolveShareWithRowOrigin = ({
  authContext,
  recordId,
}: {
  authContext: WorkspaceAuthContext;
  recordId: string;
}): Pick<RecordShareInput, 'rowCause' | 'sourceId'> => {
  if (isUserAuthContext(authContext)) {
    return {
      rowCause: RecordShareRowCause.MANUAL,
      sourceId: authContext.workspaceMemberId,
    };
  }

  if (isApplicationAuthContext(authContext)) {
    return {
      rowCause: RecordShareRowCause.APPLICATION,
      sourceId: authContext.application.id,
    };
  }

  return { rowCause: RecordShareRowCause.MANUAL, sourceId: recordId };
};

const resolveCreatorRoleId = ({
  authContext,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
}): string | null | undefined => {
  if (isApplicationAuthContext(authContext)) {
    return authContext.application.defaultRoleId;
  }

  if (isApiKeyAuthContext(authContext)) {
    return apiKeyRoleMap[authContext.apiKey.id];
  }

  return undefined;
};

const buildCreatorRows = ({
  authContext,
  apiKeyRoleMap,
  recordId,
  shareWithPrincipals,
}: {
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
  recordId: string;
  shareWithPrincipals: Pick<RecordShareInput, 'principalId'>[];
}): RecordShareInputForRecord[] => {
  if (isUserAuthContext(authContext)) {
    return [
      {
        principalId: authContext.workspaceMemberId,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: recordId,
      },
    ];
  }

  const creatorRoleId = resolveCreatorRoleId({ authContext, apiKeyRoleMap });

  if (
    !isDefined(creatorRoleId) ||
    shareWithPrincipals.some(
      (shareWithPrincipal) => shareWithPrincipal.principalId === creatorRoleId,
    )
  ) {
    return [];
  }

  return [
    {
      principalId: creatorRoleId,
      principalType: RecordSharePrincipalType.ROLE,
      accessLevel: RecordShareAccessLevel.FULL,
      ...resolveShareWithRowOrigin({ authContext, recordId }),
    },
  ];
};

export const buildRecordShareInputsForCreatedRecords = ({
  recordIds,
  objectMetadataId,
  authContext,
  apiKeyRoleMap,
  isRecordSharingEnabled,
  shareWith,
}: {
  recordIds: string[];
  objectMetadataId: string;
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
  isRecordSharingEnabled: boolean;
  shareWith?: ShareWithInput[] | null;
}): RecordShareInput[] => {
  const shareWithEntries = shareWith ?? [];
  // A record created while the flag is off is readable by everyone today and
  // must stay so once the flag turns on, whoever created it
  const everyoneFullRows =
    !isRecordSharingEnabled && !isNonEmptyArray(shareWithEntries)
      ? recordIds.map((recordId) => ({
          recordId,
          objectMetadataId,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: objectMetadataId,
        }))
      : [];

  if (!isUserAuthContext(authContext) && isNonEmptyArray(everyoneFullRows)) {
    return everyoneFullRows;
  }

  const creatorRoleId = resolveCreatorRoleId({ authContext, apiKeyRoleMap });
  const shareWithPrincipals = shareWithEntries
    .map(resolveShareWithPrincipal)
    .map((shareWithPrincipal) =>
      shareWithPrincipal.principalId === creatorRoleId
        ? { ...shareWithPrincipal, accessLevel: RecordShareAccessLevel.FULL }
        : shareWithPrincipal,
    );

  return [
    ...recordIds.flatMap((recordId) => [
      ...buildCreatorRows({
        authContext,
        apiKeyRoleMap,
        recordId,
        shareWithPrincipals,
      }).map((creatorRow) => ({ recordId, objectMetadataId, ...creatorRow })),
      ...shareWithPrincipals.map((shareWithPrincipal) => ({
        recordId,
        objectMetadataId,
        ...shareWithPrincipal,
        ...resolveShareWithRowOrigin({ authContext, recordId }),
      })),
    ]),
    ...everyoneFullRows,
  ];
};
