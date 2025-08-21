import { Injectable } from '@nestjs/common';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

import { MktLicenseService } from './mkt-license.service';
import { MktLicenseWorkspaceEntity } from './mkt-license.workspace-entity';

@Injectable()
@WorkspaceQueryHook('mktLicense.createOne')
export class MktLicenseCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(private readonly mktLicenseService: MktLicenseService) {}

  async execute(
    _authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<MktLicenseWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<MktLicenseWorkspaceEntity>> {
    const input = payload?.data;

    if (!input) {
      return payload;
    }

    if ((!input.name || input.name === '') && input.mktOrderId) {
      const generated = await this.mktLicenseService.createLicenseForOrder(
        input.mktOrderId,
      );
      Object.assign(input, generated);
    }

    return {
      ...payload,
      data: input,
    };
  }
}


