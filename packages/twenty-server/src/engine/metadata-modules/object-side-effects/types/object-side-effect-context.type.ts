import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ObjectSideEffectContext = {
  flatApplication: FlatApplication;
  now: string;
  existingViewUniversalIdentifiers: Set<string>;
  existingPageLayoutUniversalIdentifiers: Set<string>;
};
