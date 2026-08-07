import {
  FIELDS_WIDGET_SYSTEM_VIEW_KEY,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { computeSystemViewToCreate } from '../compute-system-view-to-create.util';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const objectMetadata = {
  universalIdentifier: objectUniversalIdentifier,
  labelSingular: 'Ticket',
};

describe('computeSystemViewToCreate', () => {
  it.each([ViewKey.INDEX, FIELDS_WIDGET_SYSTEM_VIEW_KEY])(
    'should derive the %s view universal identifier from the object',
    (viewKey) => {
      const result = computeSystemViewToCreate({
        applicationUniversalIdentifier,
        objectMetadata,
        viewKey,
      });

      expect(result.universalIdentifier).toBe(
        getSystemViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          objectUniversalIdentifier,
          viewKey,
        }),
      );
    },
  );

  it('should build a system-owned INDEX table view keyed on ViewKey.INDEX', () => {
    const result = computeSystemViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
      viewKey: ViewKey.INDEX,
    });

    expect(result.key).toBe(ViewKey.INDEX);
    expect(result.type).toBe(ViewType.TABLE);
    expect(result.name).toBe('All {objectLabelPlural}');
    expect(result.isSystemSideEffect).toBe(true);
    expect(result.objectMetadataUniversalIdentifier).toBe(
      objectUniversalIdentifier,
    );
    expect(result.applicationUniversalIdentifier).toBe(
      applicationUniversalIdentifier,
    );
  });

  it('should build a system-owned record-page view with a null persisted key', () => {
    const result = computeSystemViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
      viewKey: FIELDS_WIDGET_SYSTEM_VIEW_KEY,
    });

    // The record-page view key is derivation-only, never persisted.
    expect(result.key).toBeNull();
    expect(result.type).toBe(ViewType.FIELDS_WIDGET);
    expect(result.name).toBe('Ticket Record Page Fields');
    expect(result.isSystemSideEffect).toBe(true);
  });

  it('should be deterministic and independent from the view primary key', () => {
    const first = computeSystemViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
      viewKey: ViewKey.INDEX,
    });
    const second = computeSystemViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata,
      viewKey: ViewKey.INDEX,
    });

    expect(first.universalIdentifier).toBe(second.universalIdentifier);
    expect(first.id).not.toBe(second.id);
  });
});
