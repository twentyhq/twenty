// Static diff summary displayed after the assistant scaffolds the launch-ops
// CRM (Rocket, Launch, Payload, Customer, Launch site). Matches the shape of
// an IDE / Claude Code changeset.

export type FileChange = {
  path: string;
  added: number;
  removed: number;
};

export const ROCKET_CHANGESET: ReadonlyArray<FileChange> = [
  { path: 'src/__tests__/schema.integration-test.ts', added: 412, removed: 40 },
  {
    path: 'src/command-menu-items/add-payload.command-menu-item.ts',
    added: 20,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/book-slot.command-menu-item.ts',
    added: 22,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/book-window.command-menu-item.ts',
    added: 22,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/fly-again.command-menu-item.ts',
    added: 22,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/launches-from-site.command-menu-item.ts',
    added: 19,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/reschedule-launch.command-menu-item.ts',
    added: 18,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/retire-rocket.command-menu-item.ts',
    added: 20,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/schedule-launch.command-menu-item.ts',
    added: 20,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/set-customer-status.command-menu-item.ts',
    added: 19,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/set-payload-status.command-menu-item.ts',
    added: 18,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/set-site-status.command-menu-item.ts',
    added: 19,
    removed: 0,
  },
  {
    path: 'src/command-menu-items/upcoming-launches.command-menu-item.ts',
    added: 18,
    removed: 0,
  },
  { path: 'src/constants/schema-identifiers.ts', added: 112, removed: 0 },
  {
    path: 'src/navigation-menu-items/launch-sites.navigation-menu-item.ts',
    added: 16,
    removed: 0,
  },
  {
    path: 'src/navigation-menu-items/launches.navigation-menu-item.ts',
    added: 16,
    removed: 0,
  },
  {
    path: 'src/navigation-menu-items/past-launches.navigation-menu-item.ts',
    added: 16,
    removed: 0,
  },
  {
    path: 'src/navigation-menu-items/payloads.navigation-menu-item.ts',
    added: 16,
    removed: 0,
  },
  {
    path: 'src/navigation-menu-items/rockets.navigation-menu-item.ts',
    added: 3,
    removed: 6,
  },
  {
    path: 'src/navigation-menu-items/upcoming-launches.navigation-menu-item.ts',
    added: 16,
    removed: 0,
  },
  { path: 'src/objects/launch-site.object.ts', added: 128, removed: 0 },
  { path: 'src/objects/launch.object.ts', added: 237, removed: 0 },
  { path: 'src/objects/payload.object.ts', added: 198, removed: 0 },
  { path: 'src/objects/rocket.object.ts', added: 28, removed: 32 },
  { path: 'src/page-layouts/rocket-record-page-layout.ts', added: 2, removed: 2 },
  { path: 'src/views/launch-sites.view.ts', added: 49, removed: 0 },
  { path: 'src/views/launches.view.ts', added: 70, removed: 0 },
  { path: 'src/views/past-launches.view.ts', added: 82, removed: 0 },
  { path: 'src/views/payloads.view.ts', added: 63, removed: 0 },
  { path: 'src/views/rockets.view.ts', added: 12, removed: 32 },
  { path: 'src/views/upcoming-launches.view.ts', added: 82, removed: 0 },
];

export const CHANGESET_TOTALS = ROCKET_CHANGESET.reduce(
  (acc, file) => ({
    added: acc.added + file.added,
    removed: acc.removed + file.removed,
  }),
  { added: 0, removed: 0 },
);
