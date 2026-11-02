import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { UpdateTimelineActivityTypeInput } from 'src/engine/metadata-modules/timeline-activity-type/dtos/update-timeline-activity-type.input';

const TIMELINE_ACTIVITY_TYPE_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('UpdateTimelineActivityTypeInput', () => {
  it('should accept a valid update', async () => {
    const input = plainToInstance(UpdateTimelineActivityTypeInput, {
      id: TIMELINE_ACTIVITY_TYPE_ID,
      label: "Customer's call v2.0",
      icon: null,
      isActive: false,
      translations: [
        { locale: 'fr-FR', property: 'label', value: 'Appel client' },
        { locale: 'de-DE', property: 'label', value: null },
      ],
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  it('should reject an unsupported translation locale', async () => {
    const input = plainToInstance(UpdateTimelineActivityTypeInput, {
      id: TIMELINE_ACTIVITY_TYPE_ID,
      translations: [
        { locale: 'xx-XX', property: 'label', value: 'Appel client' },
      ],
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('translations');
    expect(errors[0].children?.[0]?.children?.[0]?.constraints).toHaveProperty(
      'isIn',
    );
  });
});
