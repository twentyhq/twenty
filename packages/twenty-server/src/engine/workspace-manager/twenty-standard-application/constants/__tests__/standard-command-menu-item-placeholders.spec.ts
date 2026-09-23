import { METADATA_LABEL_PLACEHOLDER_NAMES } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { INDEX_VIEW_NAME } from 'src/engine/metadata-modules/view/constants/index-view-name.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

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
  // Lingui silently drops ICU arguments it is not given, so an undeclared placeholder vanishes from translated labels
  it('only uses names the placeholder vocabulary declares', () => {
    const usedNames = new Set(
      AUTHORED_METADATA_LABELS.flatMap((label) =>
        [...label.matchAll(PLACEHOLDER_REGEX)].map(([, name]) => name),
      ),
    );

    // Guards against the check below passing vacuously
    expect(usedNames.size).toBeGreaterThan(0);
    expect(
      [...usedNames].filter((name) => {
        jestExpectToBeDefined(name);

        return !(
          METADATA_LABEL_PLACEHOLDER_NAMES as readonly string[]
        ).includes(name);
      }),
    ).toEqual([]);
  });

  it('no longer carries template expressions', () => {
    expect(
      AUTHORED_METADATA_LABELS.filter((label) => label.includes('${')),
    ).toEqual([]);
  });
});
