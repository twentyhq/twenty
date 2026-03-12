import { join } from 'path';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

// In Docker the server cwd is /app/packages/twenty-server,
// so ../twenty-apps/fixtures resolves to /app/packages/twenty-apps/fixtures.
const FIXTURES_ROOT = join(process.cwd(), '..', 'twenty-apps', 'fixtures');

export type AppSeedDefinition = {
  registration: {
    universalIdentifier: string;
    name: string;
    description: string;
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage?: string;
    author?: string;
  };
  fixtureDir: string;
};

export const APP_SEEDS: AppSeedDefinition[] = [
  {
    registration: {
      universalIdentifier: '6563e091-9f5b-4026-a3ea-7e3b3d09e218',
      name: 'Hello World',
      description: 'A sample marketplace app installed via NPM',
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: 'hello-world',
      author: 'Twenty',
    },
    fixtureDir: join(FIXTURES_ROOT, 'hello-world-app'),
  },
  {
    registration: {
      universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
      name: 'Postcard App',
      description: 'An internal app installed as tarball',
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      author: 'Twenty',
    },
    fixtureDir: join(FIXTURES_ROOT, 'postcard-app'),
  },
  {
    registration: {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
      name: 'Minimal App',
      description: 'A dev-mode app running locally',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
    },
    fixtureDir: join(FIXTURES_ROOT, 'minimal-app'),
  },
];
