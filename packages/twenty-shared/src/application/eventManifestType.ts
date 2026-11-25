import { type EVENT_PROPERTY_TYPES } from '@/application/constants/EventPropertyTypes';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type EventPropertyType = (typeof EVENT_PROPERTY_TYPES)[number];

type EventPropertyManifestBase = {
  name: string;
  isRequired?: boolean;
};

export type EventPropertyManifest =
  | (EventPropertyManifestBase & {
      type: Exclude<EventPropertyType, 'RECORD_REFERENCE'>;
    })
  | (EventPropertyManifestBase & {
      type: 'RECORD_REFERENCE';
      objectUniversalIdentifier: string;
    });

// Each capability (realtime, triggers, storage) adds its own key when it ships
export type EventCapabilitiesManifest = Record<string, never>;

export type EventManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  description?: string;
  icon?: string;
  properties: EventPropertyManifest[];
  capabilities?: EventCapabilitiesManifest;
};
