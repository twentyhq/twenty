import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';

import { computeSystemRecordFormPageLayoutToCreate } from '../compute-system-record-form-page-layout-to-create.util';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';

const objectMetadata = {
  universalIdentifier: objectUniversalIdentifier,
};

const derivedPageLayoutUniversalIdentifier =
  getSystemRecordFormPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    objectUniversalIdentifier,
  });

const derivedPageLayoutTabUniversalIdentifier =
  getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier: derivedPageLayoutUniversalIdentifier,
    title: 'Fields',
  });

describe('computeSystemRecordFormPageLayoutToCreate', () => {
  it('should build a system-owned RECORD_FORM layout on the derived identifier', () => {
    const { pageLayout } = computeSystemRecordFormPageLayoutToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
    });

    expect(pageLayout.universalIdentifier).toBe(
      derivedPageLayoutUniversalIdentifier,
    );
    expect(pageLayout.type).toBe(PageLayoutType.RECORD_FORM);
    expect(pageLayout.name).toBe('Creation Form');
    expect(pageLayout.objectMetadataUniversalIdentifier).toBe(
      objectUniversalIdentifier,
    );
    expect(pageLayout.tabUniversalIdentifiers).toEqual([
      derivedPageLayoutTabUniversalIdentifier,
    ]);
    expect(pageLayout.isSystemSideEffect).toBe(true);
  });

  it('should build a single vertical list tab holding no widget of its own', () => {
    const { pageLayoutTab } = computeSystemRecordFormPageLayoutToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
    });

    expect(pageLayoutTab.universalIdentifier).toBe(
      derivedPageLayoutTabUniversalIdentifier,
    );
    expect(pageLayoutTab.pageLayoutUniversalIdentifier).toBe(
      derivedPageLayoutUniversalIdentifier,
    );
    expect(pageLayoutTab.layoutMode).toBe(
      PageLayoutTabLayoutMode.VERTICAL_LIST,
    );
    expect(pageLayoutTab.widgetUniversalIdentifiers).toEqual([]);
    expect(pageLayoutTab.isActive).toBe(true);
    expect(pageLayoutTab.isSystemSideEffect).toBe(true);
  });
});
