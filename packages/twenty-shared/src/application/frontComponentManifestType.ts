export type FrontComponentAsset = {
  sourceAssetPath: string;
  builtAssetPath: string;
  builtAssetChecksum: string | null;
};

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string | null;
  componentName: string;
  assets?: FrontComponentAsset[];
};
