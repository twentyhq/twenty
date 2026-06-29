import {
  CLIENT_BRIEF_HOSTING_TYPES,
  type ClientBriefHostingType,
} from './hosting-type-values';

const HOSTING_TYPE_LABEL_KEYS: Record<
  ClientBriefHostingType,
  'cloud' | 'selfHosting'
> = {
  CLOUD: 'cloud',
  SELF_HOSTING: 'selfHosting',
};

export const HOSTING_TYPE_OPTIONS = CLIENT_BRIEF_HOSTING_TYPES.map((value) => ({
  labelKey: HOSTING_TYPE_LABEL_KEYS[value],
  value,
}));
