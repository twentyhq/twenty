import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  setupAllFlatEntityMaps,
  assertStandardObjectExists,
  assertStandardObjectIsSystem,
  assertAllStandardFieldsBuilt,
  assertAllStandardIndexesBuilt,
} from './standard-metadata-test-helpers';

describe('ExternalEntityLink standard metadata build', () => {
  const allFlatEntityMaps = setupAllFlatEntityMaps();

  it('builds the externalEntityLink object', () => {
    assertStandardObjectExists(
      allFlatEntityMaps,
      'externalEntityLink',
      STANDARD_OBJECTS,
    );
  });

  it('marks the externalEntityLink object as system', () => {
    assertStandardObjectIsSystem(
      allFlatEntityMaps,
      'externalEntityLink',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected fields for externalEntityLink', () => {
    assertAllStandardFieldsBuilt(
      allFlatEntityMaps,
      'externalEntityLink',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected indexes for externalEntityLink', () => {
    assertAllStandardIndexesBuilt(
      allFlatEntityMaps,
      'externalEntityLink',
      STANDARD_OBJECTS,
    );
  });
});
