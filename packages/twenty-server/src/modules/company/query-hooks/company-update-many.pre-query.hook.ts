import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CompanyDomainPayload } from 'src/modules/company/services/company-domain-uniqueness.validator';

// updateMany applies a single payload to many records. Setting domainName via
// updateMany would either be a no-op (same domain on every match — violates
// uniqueness immediately) or unintended. Block the operation rather than try
// to resolve the filter to a set of IDs.
@WorkspaceQueryHook(`company.updateMany`)
export class CompanyUpdateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs<CompanyDomainPayload>,
  ): Promise<UpdateManyResolverArgs<CompanyDomainPayload>> {
    if (payload.data?.domainName !== undefined) {
      throw new TwentyORMException(
        'domainName cannot be set via updateMany',
        TwentyORMExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The Domain Name field cannot be updated on multiple companies at once. Edit each company individually.`,
        },
      );
    }

    return payload;
  }
}
