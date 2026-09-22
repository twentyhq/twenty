import {
  INITIAL_OBJECT_VIEW_TYPE,
  INITIAL_OBJECT_VIEW_TYPE_BY_OBJECT_UNIVERSAL_IDENTIFIER,
  type InitialObjectViewType,
} from 'src/engine/metadata-modules/view/constants/initial-object-view-defaults.constant';

export const getInitialObjectViewType = (
  objectUniversalIdentifier: string,
): InitialObjectViewType =>
  INITIAL_OBJECT_VIEW_TYPE_BY_OBJECT_UNIVERSAL_IDENTIFIER.get(
    objectUniversalIdentifier,
  ) ?? INITIAL_OBJECT_VIEW_TYPE;
