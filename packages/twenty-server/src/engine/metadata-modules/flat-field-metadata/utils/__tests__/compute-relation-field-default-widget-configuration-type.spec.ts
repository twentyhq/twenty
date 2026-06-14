import { FieldMetadataType } from 'twenty-shared/types';

import { computeRelationFieldDefaultWidgetConfigurationType } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-relation-field-default-widget-configuration-type.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

describe('computeRelationFieldDefaultWidgetConfigurationType', () => {
  it.each([
    ['attachments', WidgetConfigurationType.FILES],
    ['taskTargets', WidgetConfigurationType.TASKS],
    ['noteTargets', WidgetConfigurationType.NOTES],
    ['timelineActivities', WidgetConfigurationType.TIMELINE],
  ])(
    'returns the widget configuration type for relation field %s',
    (name, expected) => {
      expect(
        computeRelationFieldDefaultWidgetConfigurationType({
          type: FieldMetadataType.RELATION,
          name,
        }),
      ).toBe(expected);
    },
  );

  it('returns undefined for a relation field without a default widget', () => {
    expect(
      computeRelationFieldDefaultWidgetConfigurationType({
        type: FieldMetadataType.RELATION,
        name: 'opportunities',
      }),
    ).toBeUndefined();
  });

  it('returns undefined for a non-relation field even when the name matches', () => {
    expect(
      computeRelationFieldDefaultWidgetConfigurationType({
        type: FieldMetadataType.TEXT,
        name: 'attachments',
      }),
    ).toBeUndefined();
  });
});
