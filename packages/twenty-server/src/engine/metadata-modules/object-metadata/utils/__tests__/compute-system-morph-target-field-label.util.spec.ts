import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { computeSystemMorphTargetFieldLabel } from 'src/engine/metadata-modules/object-metadata/utils/compute-system-morph-target-field-label.util';

describe('computeSystemMorphTargetFieldLabel', () => {
  it('keeps the shared label for attachment targets', () => {
    expect(
      computeSystemMorphTargetFieldLabel({
        morphId: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
        targetObjectNameSingular: 'pet',
      }),
    ).toBe('Attached to');
  });

  it.each([
    ['noteTarget', STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId],
    ['taskTarget', STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId],
  ])('keeps the shared label for %s targets', (_objectName, morphId) => {
    expect(
      computeSystemMorphTargetFieldLabel({
        morphId,
        targetObjectNameSingular: 'pet',
      }),
    ).toBe('Linked to');
  });

  it('uses the target object name for other morph groups', () => {
    expect(
      computeSystemMorphTargetFieldLabel({
        morphId: '20202020-0000-0000-0000-000000000000',
        targetObjectNameSingular: 'pet',
      }),
    ).toBe('Pet');
  });

  it('uses the target object name when there is no morph group', () => {
    expect(
      computeSystemMorphTargetFieldLabel({
        morphId: null,
        targetObjectNameSingular: 'pet',
      }),
    ).toBe('Pet');
  });
});
