import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

const findMonorepoRoot = (): string => {
  let current = resolve(__dirname);

  while (current !== dirname(current)) {
    if (existsSync(join(current, 'nx.json'))) {
      return current;
    }
    current = dirname(current);
  }

  return process.cwd();
};

const FIXTURES_ROOT = join(
  findMonorepoRoot(),
  'packages',
  'twenty-apps',
  'fixtures',
);

export type AppSeedDefinition = {
  registration: {
    universalIdentifier: string;
    name: string;
    description: string;
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage?: string;
    author?: string;
  };
  outputDir: string;
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
    outputDir: join(FIXTURES_ROOT, 'hello-world-app', '.twenty', 'output'),
  },
  {
    registration: {
      universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
      name: 'Postcard App',
      description: 'An internal app installed as tarball',
      sourceType: ApplicationRegistrationSourceType.TARBALL,
      author: 'Twenty',
    },
    outputDir: join(FIXTURES_ROOT, 'postcard-app', '.twenty', 'output'),
  },
  {
    registration: {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
      name: 'Minimal App',
      description: 'A dev-mode app running locally',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
    },
    outputDir: join(FIXTURES_ROOT, 'minimal-app', '.twenty', 'output'),
  },
];
