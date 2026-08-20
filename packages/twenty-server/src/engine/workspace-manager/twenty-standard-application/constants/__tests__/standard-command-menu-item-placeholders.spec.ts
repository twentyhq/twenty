import { METADATA_LABEL_PLACEHOLDER_NAMES } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

const AUTHORED_METADATA_LABELS = [
  ...Object.values(STANDARD_COMMAND_MENU_ITEMS).flatMap((item) =>
    [item.label, item.shortLabel, item.icon].filter(isDefined),
  ),
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
  NAVIGATION_INTERPOLATED_ICON,
  INDEX_VIEW_NAME,
];

describe('authored metadata label placeholders', () => {
  // Lingui drops ICU arguments it is not given, so a placeholder outside the
  // closed vocabulary would be silently erased from the translated label
  // instead of reaching whoever can fill it.
  it('only uses names the placeholder vocabulary declares', () => {
    const usedNames = new Set(
      AUTHORED_METADATA_LABELS.flatMap((label) =>
        [...label.matchAll(PLACEHOLDER_REGEX)].map(([, name]) => name),
      ),
    );

    // Guards the assertion below against passing vacuously if the authored
    // labels stopped carrying placeholders at all.
    expect(usedNames.size).toBeGreaterThan(0);
    expect(
      [...usedNames].filter(
        (name) =>
          !(METADATA_LABEL_PLACEHOLDER_NAMES as readonly string[]).includes(
            name,
          ),
      ),
    ).toEqual([]);
  });

  it('no longer carries template expressions', () => {
    expect(
      AUTHORED_METADATA_LABELS.filter((label) => label.includes('${')),
    ).toEqual([]);
  });
});
