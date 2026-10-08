import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';
import { ViewType } from 'twenty-shared/types';

import { computeInitialObjectViewToCreate } from 'src/engine/metadata-modules/view/utils/compute-initial-object-view-to-create.util';

describe('computeInitialObjectViewToCreate', () => {
  const applicationUniversalIdentifier = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const objectMetadata = {
    universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
    labelPlural: 'Companies',
  };

  it('should be owned by the user rather than the engine', () => {
    const initialView = computeInitialObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(initialView.isSystemSideEffect).toBe(false);
    expect(initialView.key).toBeNull();
  });

  it('should be a table view named after the object', () => {
    const initialView = computeInitialObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(initialView.type).toBe(ViewType.TABLE);
    expect(initialView.name).toBe('All Companies');
  });

  it('should use the deterministic initial identifier', () => {
    const initialView = computeInitialObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(initialView.universalIdentifier).toBe(
      getInitialObjectViewUniversalIdentifier({
        viewApplicationUniversalIdentifier: applicationUniversalIdentifier,
        objectUniversalIdentifier: objectMetadata.universalIdentifier,
      }),
    );
  });

  it('should sort after a view initial at position zero', () => {
    const initialView = computeInitialObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(initialView.position).toBeGreaterThan(0);
  });
});
