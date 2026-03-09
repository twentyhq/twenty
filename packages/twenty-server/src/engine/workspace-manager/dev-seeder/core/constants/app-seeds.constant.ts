import { readFileSync } from 'fs';
import { join } from 'path';

import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

export type AppSeedDefinition = {
  registration: {
    universalIdentifier: string;
    name: string;
    description: string;
    sourceType: ApplicationRegistrationSourceType;
    sourcePackage: string | null;
    author: string;
  };
  manifest: Manifest;
  packageJson: Record<string, unknown>;
};

const RICH_APP_PACKAGE_JSON = {
  name: 'rich-app',
  version: '0.1.0',
};

const ROOT_APP_PACKAGE_JSON = {
  name: 'root-app',
  version: '0.1.0',
};

const loadManifest = (filename: string): Manifest => {
  const raw = readFileSync(join(__dirname, filename), 'utf-8');
  const replaced = raw.replace(/\[checksum\]/g, 'seed');

  return JSON.parse(replaced) as Manifest;
};

export const APP_SEEDS: AppSeedDefinition[] = [
  {
    registration: {
      universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
      name: 'Hello World',
      description: 'A simple rich app',
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: '@twentyhq/hello-world',
      author: 'Twenty',
    },
    manifest: loadManifest('rich-app-manifest.json'),
    packageJson: RICH_APP_PACKAGE_JSON,
  },
  {
    registration: {
      universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000001',
      name: 'Root App',
      description: 'An app with all entities at root level',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      sourcePackage: null,
      author: 'Twenty',
    },
    manifest: loadManifest('root-app-manifest.json'),
    packageJson: ROOT_APP_PACKAGE_JSON,
  },
];
