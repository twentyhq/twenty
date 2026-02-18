export type FrontComponentFramework = 'react' | 'vue' | 'svelte' | 'angular';

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  framework?: FrontComponentFramework;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string;
  componentName: string;
};
