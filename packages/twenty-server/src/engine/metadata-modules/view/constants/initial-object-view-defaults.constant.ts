import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

import { INITIAL_OBJECT_VIEW_POSITION } from 'src/engine/metadata-modules/view/constants/initial-object-view-position.constant';

export type InitialObjectViewDefault = {
  type: ViewType;
  position: number;
};

export const INITIAL_OBJECT_VIEW_DEFAULT: InitialObjectViewDefault = {
  type: ViewType.TABLE,
  position: INITIAL_OBJECT_VIEW_POSITION,
};

export const INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, InitialObjectViewDefault>
> = {
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]: {
    type: ViewType.LIST,
    position: INITIAL_OBJECT_VIEW_POSITION,
  },
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]: {
    type: ViewType.TABLE,
    position: 3,
  },
};

export const getInitialObjectViewDefault = (
  objectUniversalIdentifier: string,
): InitialObjectViewDefault =>
  INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER[
    objectUniversalIdentifier
  ] ?? INITIAL_OBJECT_VIEW_DEFAULT;
