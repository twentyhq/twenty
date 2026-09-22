import {
  INITIAL_OBJECT_VIEW_DEFAULT,
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER,
  type InitialObjectViewDefault,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';

export const getInitialObjectViewDefault = (
  objectUniversalIdentifier: string,
): InitialObjectViewDefault =>
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER.get(
    objectUniversalIdentifier,
  ) ?? INITIAL_OBJECT_VIEW_DEFAULT;
