import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceMemberUpdateOnePreQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-update-one.pre-query.hook';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

describe('WorkspaceMemberUpdateOnePreQueryHook', () => {
  const hook = new WorkspaceMemberUpdateOnePreQueryHook();
  const authContext = {} as WorkspaceAuthContext;

  const buildPayload = (
    data: Partial<WorkspaceMemberWorkspaceEntity>,
  ): UpdateOneResolverArgs<Partial<WorkspaceMemberWorkspaceEntity>> => ({
    id: 'workspace-member-id',
    data,
  });

  it('should pass through when timeZone is not updated', async () => {
    const payload = buildPayload({ colorScheme: 'Light' });

    await expect(
      hook.execute(authContext, 'workspaceMember', payload),
    ).resolves.toEqual(payload);
  });

  it('should pass through the system time zone', async () => {
    const payload = buildPayload({ timeZone: 'system' });

    await expect(
      hook.execute(authContext, 'workspaceMember', payload),
    ).resolves.toEqual(payload);
  });

  it('should pass through a supported IANA time zone', async () => {
    const payload = buildPayload({ timeZone: 'Europe/Paris' });

    await expect(
      hook.execute(authContext, 'workspaceMember', payload),
    ).resolves.toEqual(payload);
  });

  it('should canonicalize a legacy alias time zone', async () => {
    const payload = buildPayload({ timeZone: 'CET' });

    await expect(
      hook.execute(authContext, 'workspaceMember', payload),
    ).resolves.toEqual(buildPayload({ timeZone: 'Europe/Paris' }));
  });

  it('should reject an unknown time zone', async () => {
    const payload = buildPayload({ timeZone: 'Mars/Olympus' });

    await expect(
      hook.execute(authContext, 'workspaceMember', payload),
    ).rejects.toThrow('Invalid time zone: Mars/Olympus');
  });
});
