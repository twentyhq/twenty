import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { fromApplicationVariableManifestToUniversalFlatApplicationVariable } from 'src/engine/core-modules/application/application-manifest/converters/from-application-variable-manifest-to-universal-flat-application-variable.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { findNonUpdatablePropertyDivergences } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/find-non-updatable-property-divergences.util';

const NOW = '2026-01-01T00:00:00.000Z';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';

const buildPageLayoutTab = ({
  pageLayoutUniversalIdentifier,
  title = 'Overview',
  now = NOW,
}: {
  pageLayoutUniversalIdentifier: string;
  title?: string;
  now?: string;
}) =>
  fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
    pageLayoutTabManifest: {
      universalIdentifier: 'page-layout-tab-universal-identifier',
      title,
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [],
    },
    pageLayoutUniversalIdentifier,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now,
  });

const buildApplicationVariable = ({ isSecret }: { isSecret: boolean }) =>
  fromApplicationVariableManifestToUniversalFlatApplicationVariable({
    key: 'API_KEY',
    universalIdentifier: 'application-variable-universal-identifier',
    defaultValue: null,
    isSecret,
    applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });

describe('findNonUpdatablePropertyDivergences', () => {
  it('should report a page layout tab moved to another page layout', () => {
    expect(
      findNonUpdatablePropertyDivergences({
        fromUniversalFlatEntity: buildPageLayoutTab({
          pageLayoutUniversalIdentifier: 'page-layout-a',
        }),
        toUniversalFlatEntity: buildPageLayoutTab({
          pageLayoutUniversalIdentifier: 'page-layout-b',
        }),
        metadataName: 'pageLayoutTab',
      }),
    ).toEqual(['pageLayoutUniversalIdentifier']);
  });

  it.each([
    { fromIsSecret: true, toIsSecret: false },
    { fromIsSecret: false, toIsSecret: true },
  ])(
    'should report an application variable isSecret change from $fromIsSecret to $toIsSecret',
    ({ fromIsSecret, toIsSecret }) => {
      expect(
        findNonUpdatablePropertyDivergences({
          fromUniversalFlatEntity: buildApplicationVariable({
            isSecret: fromIsSecret,
          }),
          toUniversalFlatEntity: buildApplicationVariable({
            isSecret: toIsSecret,
          }),
          metadataName: 'applicationVariable',
        }),
      ).toEqual(['isSecret']);
    },
  );

  it('should ignore a stored value the incoming entity does not define', () => {
    expect(
      findNonUpdatablePropertyDivergences({
        fromUniversalFlatEntity: {
          ...buildApplicationVariable({ isSecret: true }),
          value: 'enc:v2:stored' as EncryptedString,
        },
        toUniversalFlatEntity: buildApplicationVariable({ isSecret: true }),
        metadataName: 'applicationVariable',
      }),
    ).toEqual([]);
  });

  it('should ignore comparable and server-managed property changes', () => {
    expect(
      findNonUpdatablePropertyDivergences({
        fromUniversalFlatEntity: buildPageLayoutTab({
          pageLayoutUniversalIdentifier: 'page-layout-a',
        }),
        toUniversalFlatEntity: buildPageLayoutTab({
          pageLayoutUniversalIdentifier: 'page-layout-a',
          title: 'Renamed',
          now: '2027-01-01T00:00:00.000Z',
        }),
        metadataName: 'pageLayoutTab',
      }),
    ).toEqual([]);
  });
});
