import { desc } from 'drizzle-orm';

import { findOne } from '@/database/database';
import { githubStarsModel } from '@/database/model';
import { formatNumberOfStars } from '@/shared-utils/formatNumberOfStars';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const githubStars = await findOne(
      githubStarsModel,
      desc(githubStarsModel.timestamp),
    );

    const githubNumberOfStars = formatNumberOfStars(
      githubStars[0].numberOfStars,
    );

    return Response.json({ githubNumberOfStars });
  } catch (error: any) {
    return new Response(`Github stars error: ${error?.message}`, {
      status: 500,
    });
  }
}
