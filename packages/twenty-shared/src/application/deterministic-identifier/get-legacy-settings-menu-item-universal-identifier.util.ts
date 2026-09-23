import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const LEGACY_SETTINGS_MENU_ITEM_DISCRIMINATOR = 'legacy-settings-tab';

// An application built before defineSettingsMenuItem existed declares no item,
// only the deprecated settingsCustomTabFrontComponentId pointer. The upgrade
// backfill and the manifest sync both derive the item's identity from that
// pointer with this function, so syncing such an application finds the row the
// backfill created instead of deleting it and creating another.
export const getLegacySettingsMenuItemUniversalIdentifier = ({
  applicationUniversalIdentifier,
  frontComponentUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  frontComponentUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'settingsMenuItem',
    value: `${frontComponentUniversalIdentifier}:${LEGACY_SETTINGS_MENU_ITEM_DISCRIMINATOR}`,
    applicationUniversalIdentifier,
  });
