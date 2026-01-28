import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// This hook is ONLY for testing purposes to exercise the save() method with files field sync
// It uses save() on the incoming data to test the upsert flow before the actual createOne
@WorkspaceQueryHook(`person.createOne`)
export class PersonCreateManyTestSavePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateOneResolverArgs<Partial<PersonWorkspaceEntity>>,
  ): Promise<CreateOneResolverArgs<Partial<PersonWorkspaceEntity>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    // Test save() method by attempting to save the record
    // This exercises the files field sync in the save() path
    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext as WorkspaceAuthContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspace.id,
            'person',
            {
              shouldBypassPermissionChecks: true,
            },
          );

        try {
          await personRepository.save(payload.data as PersonWorkspaceEntity);
        } catch (error) {
          console.log('error', error);
          throw error;
        }
      },
    );

    // Return the original payload to continue with normal createOne
    return payload;
  }
}
