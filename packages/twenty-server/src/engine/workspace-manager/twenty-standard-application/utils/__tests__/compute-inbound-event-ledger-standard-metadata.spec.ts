import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  setupAllFlatEntityMaps,
  assertStandardObjectExists,
  assertStandardObjectIsSystem,
  assertAllStandardFieldsBuilt,
  assertAllStandardIndexesBuilt,
} from './standard-metadata-test-helpers';

describe('InboundEventLedger standard metadata build', () => {
  const allFlatEntityMaps = setupAllFlatEntityMaps();

  it('builds the inboundEventLedger object', () => {
    assertStandardObjectExists(
      allFlatEntityMaps,
      'inboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('marks the inboundEventLedger object as system', () => {
    assertStandardObjectIsSystem(
      allFlatEntityMaps,
      'inboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected fields for inboundEventLedger', () => {
    assertAllStandardFieldsBuilt(
      allFlatEntityMaps,
      'inboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected indexes for inboundEventLedger', () => {
    assertAllStandardIndexesBuilt(
      allFlatEntityMaps,
      'inboundEventLedger',
      STANDARD_OBJECTS,
    );
  });
});
