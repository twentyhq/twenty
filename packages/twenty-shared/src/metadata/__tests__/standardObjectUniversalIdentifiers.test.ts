import { STANDARD_OBJECTS } from '@/metadata/constants/standard-object.constant';

// Universal identifiers are the stable identity of standard metadata across
// every workspace: mutating one makes the metadata sync delete and recreate
// the entity (data loss for fields) on every existing installation.
//
// This snapshot pins every universal identifier of STANDARD_OBJECTS,
// including the ones deterministically derived at module load for system
// fields. If this test fails, a universal identifier changed: make sure the
// change is intentional and ships with a coordinated backfill of existing
// workspaces before updating the snapshot.
describe('STANDARD_OBJECTS universal identifiers', () => {
  it('should never change without an explicit snapshot update', () => {
    expect(STANDARD_OBJECTS).toMatchSnapshot();
  });
});
