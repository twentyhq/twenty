import { ROCKET_CHANGESET } from './rocket-changeset';

export const CHANGESET_TOTALS = ROCKET_CHANGESET.reduce(
  (totals, file) => ({
    added: totals.added + file.added,
    removed: totals.removed + file.removed,
  }),
  { added: 0, removed: 0 },
);
