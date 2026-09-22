import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

export type InitialObjectViewType = ViewType.TABLE | ViewType.LIST;

export const INITIAL_OBJECT_VIEW_POSITION = 1;

export const INITIAL_OBJECT_VIEW_TYPE = ViewType.TABLE;

export const INITIAL_OBJECT_VIEW_TYPE_BY_OBJECT_UNIVERSAL_IDENTIFIER = new Map<
  string,
  InitialObjectViewType
>([[STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageCampaign, ViewType.LIST]]);

export const OBJECT_UNIVERSAL_IDENTIFIERS_WITHOUT_INITIAL_VIEW =
  new Set<string>([STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity]);
