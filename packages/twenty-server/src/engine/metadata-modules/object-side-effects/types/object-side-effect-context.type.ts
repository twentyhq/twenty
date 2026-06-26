import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ObjectSideEffectContext = {
  flatApplication: FlatApplication;
  now: string;
  existingViewUniversalIdentifiers: Set<string>;
  existingPageLayoutUniversalIdentifiers: Set<string>;
  junctionObjectByNameSingular: Map<string, FlatObjectMetadata>;
};
