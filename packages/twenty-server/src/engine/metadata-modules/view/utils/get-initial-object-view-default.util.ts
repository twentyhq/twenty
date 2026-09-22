import {
  INITIAL_OBJECT_VIEW_DEFAULT,
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER,
  type InitialObjectViewDefault,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';

export const getInitialObjectViewDefault = (
  objectUniversalIdentifier: string,
): InitialObjectViewDefault =>
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER[
    objectUniversalIdentifier as keyof typeof INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER
  ] ?? INITIAL_OBJECT_VIEW_DEFAULT;
