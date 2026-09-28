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

  it('uses the target object name for other morph groups', () => {
    expect(
      computeSystemMorphTargetFieldLabel({
        morphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
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
