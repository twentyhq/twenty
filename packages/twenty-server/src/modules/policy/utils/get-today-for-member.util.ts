import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

const DEFAULT_TIMEZONE = 'America/New_York';

// Returns today's date (YYYY-MM-DD) in the workspace member's configured timezone.
// Falls back to America/New_York if the member has 'system' or no timezone set.
export async function getTodayForMember(
  workspaceId: string,
  workspaceMemberId: string,
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
): Promise<string> {
  let timeZone = DEFAULT_TIMEZONE;

  try {
    const memberRepo = await globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'workspaceMember',
      { shouldBypassPermissionChecks: true },
    );

    const member = (await memberRepo.findOne({
      where: { id: workspaceMemberId },
    })) as Record<string, unknown> | null;

    const storedTimeZone = member?.timeZone as string | null;

    if (storedTimeZone && storedTimeZone !== 'system') {
      timeZone = storedTimeZone;
    }
  } catch {
    // Fall back to default timezone
  }

  return new Date().toLocaleDateString('en-CA', { timeZone });
}
