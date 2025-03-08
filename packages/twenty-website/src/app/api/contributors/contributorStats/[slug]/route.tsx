import { getContributorActivity } from '@/app/(public)/contributors/utils/get-contributor-activity';
import { executePartialSync } from '@/github/execute-partial-sync';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = request.url;

    const username = url.split('/')?.pop() || '';

    await executePartialSync();

    const contributorActivity = await getContributorActivity(username);

    if (contributorActivity) {
      const mergedPRsCount = contributorActivity.mergedPRsCount;
      const rank = contributorActivity.rank;
      return Response.json({ mergedPRsCount, rank });
    }
  } catch (error: any) {
    return new Response(`Contributor stats error: ${error?.message}`, {
      status: 500,
    });
  }
}
