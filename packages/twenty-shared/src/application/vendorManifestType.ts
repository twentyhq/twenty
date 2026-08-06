export type VendorManifest = {
  dependencies: string[];
  sourceVendorPath: string;
  builtVendorPath: string;
  builtVendorChecksum: string | null;
};
