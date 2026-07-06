import { STANDARD_OBJECTS } from '@/metadata/constants/standard-object.constant';

// If this test fails, a universal identifier changed: make sure the
// change is intentional and ships with a coordinated backfill of existing
// workspaces before updating the snapshot.
describe('STANDARD_OBJECTS universal identifiers', () => {
  it('should never change without an explicit snapshot update', () => {
    expect(STANDARD_OBJECTS).toMatchSnapshot();
  });
});
