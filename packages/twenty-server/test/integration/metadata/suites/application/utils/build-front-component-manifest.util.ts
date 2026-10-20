import { type FrontComponentManifest } from 'twenty-shared/application';

export const buildFrontComponentManifest = ({
  universalIdentifier,
  componentName,
}: {
  universalIdentifier: string;
  componentName: string;
}): FrontComponentManifest => ({
  universalIdentifier,
  name: componentName,
  description: `The ${componentName} page of the application`,
  sourceComponentPath: `src/front-components/${componentName}.tsx`,
  builtComponentPath: `src/front-components/${componentName}.mjs`,
  builtComponentChecksum: `${componentName}-checksum`,
  componentName,
  isHeadless: false,
});
