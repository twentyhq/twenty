import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// This hook is ONLY for testing purposes to exercise the save() method with files field sync
// It uses save() on the incoming data to test the upsert flow before the actual createMany
@WorkspaceQueryHook(`person.createMany`)
export class PersonCreateManyTestSavePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: AuthContext,
    objectName: string,
    payload: CreateManyResolverArgs<Partial<PersonWorkspaceEntity>>,
  ): Promise<CreateManyResolverArgs<Partial<PersonWorkspaceEntity>>> {
    if (!isDefined(payload.data)) {
      return payload;
    }

    const workspace = authContext.workspace;

    if (!isDefined(workspace)) {
      return payload;
    }

    // Test save() method by attempting to save each record
    // This exercises the files field sync in the save() path
    const workspaceDataSource =
      await this.globalWorkspaceOrmManager.getWorkspaceDataSource(workspace.id);

    const entityManager = workspaceDataSource.getRepository('person');

    // For each person in the payload, test save() if they have files
    for (const personData of payload.data) {
      // Only test save() if the person has a files field
      // @ts-expect-error - checking for files field dynamically
      if (isDefined(personData.avatars) || isDefined(personData.files)) {
        try {
          // Use save() which will trigger the files field sync logic
          await entityManager.save(personData as PersonWorkspaceEntity, {
            shouldBypassPermissionChecks: true,
          });
        } catch (error) {
          // Log but don't fail the pre-hook if save() fails
          console.log(
            'Test save in pre-hook encountered error (expected for new records):',
            error,
          );
        }
      }
    }

    // Return the original payload to continue with normal createMany
    return payload;
  }
}
