import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  type StandardObjectWithUniversalIdentifierName,
} from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

export type InitialObjectViewType = ViewType.TABLE | ViewType.LIST;

export type InitialObjectViewDefault = {
  type: InitialObjectViewType;
  position: number;
};

export const INITIAL_OBJECT_VIEW_POSITION = 1;

export const INITIAL_OBJECT_VIEW_POSITION_AFTER_STANDARD_VIEWS = 3;

export const INITIAL_OBJECT_VIEW_DEFAULT: InitialObjectViewDefault = {
  type: ViewType.TABLE,
  position: INITIAL_OBJECT_VIEW_POSITION,
};

export const INITIAL_OBJECT_VIEW_DEFAULT_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<
    (typeof STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[StandardObjectWithUniversalIdentifierName],
    InitialObjectViewDefault
  >
> = {
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign]: {
    type: ViewType.LIST,
    position: INITIAL_OBJECT_VIEW_POSITION,
  },
  [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]: {
    type: ViewType.TABLE,
    position: INITIAL_OBJECT_VIEW_POSITION_AFTER_STANDARD_VIEWS,
  },
};
