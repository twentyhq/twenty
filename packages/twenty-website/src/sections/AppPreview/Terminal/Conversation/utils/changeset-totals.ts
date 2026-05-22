import { ROCKET_CHANGESET } from './rocket-changeset';

export const CHANGESET_TOTALS = ROCKET_CHANGESET.reduce(
  (acc, file) => ({
    added: acc.added + file.added,
    removed: acc.removed + file.removed,
  }),
  { added: 0, removed: 0 },
);
