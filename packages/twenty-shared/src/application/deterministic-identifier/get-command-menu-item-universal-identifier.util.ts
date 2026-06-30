import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const NAVIGATION_COMMAND_DISCRIMINATOR = 'navigation';

// A command menu item is identified by its availabilityType + engineComponentKey
// (the same engineComponentKey is reused across availability types and, for
// RECORD_SELECTION, across objects). One util per availabilityType, prefixed by
// the type, with the target object added only for RECORD_SELECTION.

// GLOBAL: a command available everywhere, identified by its engineComponentKey.
export const getGlobalCommandMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  engineComponentKey,
}: {
  applicationUniversalIdentifier: string;
  engineComponentKey: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `GLOBAL:${engineComponentKey}`,
    applicationUniversalIdentifier,
  });

// GLOBAL_OBJECT_CONTEXT: a command whose object is resolved at runtime (not stored),
// identified by its engineComponentKey.
export const getGlobalObjectContextCommandMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  engineComponentKey,
}: {
  applicationUniversalIdentifier: string;
  engineComponentKey: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `GLOBAL_OBJECT_CONTEXT:${engineComponentKey}`,
    applicationUniversalIdentifier,
  });

// RECORD_SELECTION: a command acting on selected records; the same engineComponentKey
// is replicated per object, so the target object is part of the identity
// (null/absent for the object-agnostic record-selection commands).
export const getRecordSelectionCommandMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  engineComponentKey,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  engineComponentKey: string;
  objectUniversalIdentifier?: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `RECORD_SELECTION:${engineComponentKey}:${objectUniversalIdentifier ?? ''}`,
    applicationUniversalIdentifier,
  });

// An object's singleton navigation command, keyed by the object + the 'navigation' role.
export const getNavigationCommandUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'commandMenuItem',
    value: `${objectUniversalIdentifier}:${NAVIGATION_COMMAND_DISCRIMINATOR}`,
    applicationUniversalIdentifier,
  });
