import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  IANA_TIME_ZONES,
  LEGACY_TIME_ZONE_TO_IANA,
  type IanaTimeZone,
} from 'twenty-shared/constants';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const VALID_TIME_ZONES = new Set<string>(IANA_TIME_ZONES);

const isIanaTimeZone = (value: string): value is IanaTimeZone =>
  VALID_TIME_ZONES.has(value);

@WorkspaceQueryHook(`workspaceMember.updateOne`)
export class WorkspaceMemberUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Partial<WorkspaceMemberWorkspaceEntity>>,
  ): Promise<UpdateOneResolverArgs<Partial<WorkspaceMemberWorkspaceEntity>>> {
    // The entity types timeZone as IanaTimeZone | 'system', but the GraphQL
    // input is an unvalidated string at runtime — this hook is what upholds
    // the type.
    const timeZone: string | undefined = payload.data?.timeZone;

    if (!isNonEmptyString(timeZone) || timeZone === 'system') {
      return payload;
    }

    // Legacy aliases (e.g. CET) crash date rendering on engines rejecting
    // them (WebKit), so they are canonicalized rather than rejected to keep
    // older clients working.
    const canonicalTimeZone = LEGACY_TIME_ZONE_TO_IANA[timeZone] ?? timeZone;

    if (!isIanaTimeZone(canonicalTimeZone)) {
      throw new CommonQueryRunnerException(
        `Invalid time zone: ${timeZone}`,
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`Invalid time zone.` },
      );
    }

    return {
      ...payload,
      data: { ...payload.data, timeZone: canonicalTimeZone },
    };
  }
}
