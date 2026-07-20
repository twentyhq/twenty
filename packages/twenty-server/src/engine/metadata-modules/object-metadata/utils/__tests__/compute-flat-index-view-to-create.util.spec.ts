import { getSystemViewUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { computeFlatIndexViewToCreate } from '../compute-flat-index-view-to-create.util';

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';

describe('computeFlatIndexViewToCreate', () => {
  it('should derive the INDEX view universal identifier from the object', () => {
    const result = computeFlatIndexViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata: { universalIdentifier: objectUniversalIdentifier },
    });

    expect(result.universalIdentifier).toBe(
      getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier,
        viewKey: ViewKey.INDEX,
      }),
    );
  });

  it('should build a system-owned INDEX table view keyed on ViewKey.INDEX', () => {
    const result = computeFlatIndexViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata: { universalIdentifier: objectUniversalIdentifier },
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

  it('should be deterministic and independent from the view primary key', () => {
    const first = computeFlatIndexViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata: { universalIdentifier: objectUniversalIdentifier },
    });
    const second = computeFlatIndexViewToCreate({
      applicationUniversalIdentifier,
      objectMetadata: { universalIdentifier: objectUniversalIdentifier },
    });

    expect(first.universalIdentifier).toBe(second.universalIdentifier);
    expect(first.id).not.toBe(second.id);
  });
});
