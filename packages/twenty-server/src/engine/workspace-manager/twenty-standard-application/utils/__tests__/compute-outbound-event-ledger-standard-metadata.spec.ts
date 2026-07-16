import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  setupAllFlatEntityMaps,
  assertStandardObjectExists,
  assertStandardObjectIsSystem,
  assertAllStandardFieldsBuilt,
  assertAllStandardIndexesBuilt,
} from './standard-metadata-test-helpers';

describe('OutboundEventLedger standard metadata build', () => {
  const allFlatEntityMaps = setupAllFlatEntityMaps();

  it('builds the outboundEventLedger object', () => {
    assertStandardObjectExists(
      allFlatEntityMaps,
      'outboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('marks the outboundEventLedger object as system', () => {
    assertStandardObjectIsSystem(
      allFlatEntityMaps,
      'outboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected fields for outboundEventLedger', () => {
    assertAllStandardFieldsBuilt(
      allFlatEntityMaps,
      'outboundEventLedger',
      STANDARD_OBJECTS,
    );
  });

  it('builds all expected indexes for outboundEventLedger', () => {
    assertAllStandardIndexesBuilt(
      allFlatEntityMaps,
      'outboundEventLedger',
      STANDARD_OBJECTS,
    );
  });
});
