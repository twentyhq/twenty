import { getSeededObjectViewUniversalIdentifier } from 'twenty-shared/application';
import { ViewType } from 'twenty-shared/types';

import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';

describe('computeSeededObjectViewToCreate', () => {
  const applicationUniversalIdentifier = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const objectMetadata = {
    universalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
    labelPlural: 'Companies',
  };

  it('should be owned by the user rather than the engine', () => {
    const seededView = computeSeededObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(seededView.isSystemSideEffect).toBe(false);
    expect(seededView.key).toBeNull();
  });

  it('should be a table view named after the object', () => {
    const seededView = computeSeededObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(seededView.type).toBe(ViewType.TABLE);
    expect(seededView.name).toBe('All Companies');
  });

  it('should use the deterministic seeded identifier', () => {
    const seededView = computeSeededObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(seededView.universalIdentifier).toBe(
      getSeededObjectViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        objectUniversalIdentifier: objectMetadata.universalIdentifier,
      }),
    );
  });

  it('should sort after a view seeded at position zero', () => {
    const seededView = computeSeededObjectViewToCreate({
      objectMetadata,
      applicationUniversalIdentifier,
    });

    expect(seededView.position).toBeGreaterThan(0);
  });
});
