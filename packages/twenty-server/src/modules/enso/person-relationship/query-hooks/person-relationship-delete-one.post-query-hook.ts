import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { extractRowRefs } from 'src/modules/enso/person-relationship/query-hooks/extract-row-refs.util';
import { PersonRelationshipMirrorService } from 'src/modules/enso/person-relationship/services/person-relationship-mirror.service';

@Injectable()
@WorkspaceQueryHook({
  key: `personRelationship.deleteOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class PersonRelationshipDeleteOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly mirrorService: PersonRelationshipMirrorService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    // deleteMirrorFor short-circuits on mirror rows so deleting a mirror
    // never cascades back to canonical.
    for (const ref of extractRowRefs(payload)) {
      await this.mirrorService.deleteMirrorFor(authContext, ref);
    }
  }
}
