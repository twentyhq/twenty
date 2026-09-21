import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

const LEGACY_SETTING_PAGE_DISCRIMINATOR = 'legacy-settings-tab';

// An application built before defineSettingPage existed declares no page, only
// the deprecated settingsCustomTabFrontComponentId pointer. The upgrade
// backfill and the manifest sync both derive the page's identity from that
// pointer with this function, so syncing such an application finds the row the
// backfill created instead of deleting it and creating another.
export const getLegacySettingPageUniversalIdentifier = ({
  applicationUniversalIdentifier,
  frontComponentUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  frontComponentUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'settingPage',
    value: `${frontComponentUniversalIdentifier}:${LEGACY_SETTING_PAGE_DISCRIMINATOR}`,
    applicationUniversalIdentifier,
  });
