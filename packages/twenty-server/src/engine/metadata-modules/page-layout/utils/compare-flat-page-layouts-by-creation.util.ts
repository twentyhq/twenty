import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

// Page layout lists are cursor-paginated, so they need one deterministic order
// shared by every read path; id breaks ties on identical creation timestamps.
export const compareFlatPageLayoutsByCreation = (
  first: Pick<FlatPageLayout, 'createdAt' | 'id'>,
  second: Pick<FlatPageLayout, 'createdAt' | 'id'>,
): number =>
  first.createdAt.localeCompare(second.createdAt) ||
  first.id.localeCompare(second.id);
