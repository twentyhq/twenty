import { getDefaultRelationFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-default-relation-field-universal-identifier.util';
import { getSystemRelationFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-relation-field-universal-identifier.util';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from '@/metadata/constants/standard-object-universal-identifiers.constant';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getDefaultRelationFieldUniversalIdentifier', () => {
  it.each([
    [
      'timelineActivities',
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.timelineActivity,
    ],
    ['attachments', STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment],
    ['noteTargets', STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget],
    ['taskTargets', STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget],
  ] as const)(
    'derives the %s field identifier as the system relation towards its standard relation object',
    (defaultRelation, standardRelationObjectUniversalIdentifier) => {
      expect(
        getDefaultRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier: APP,
          objectUniversalIdentifier: OBJECT,
          defaultRelation,
        }),
      ).toBe(
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier: APP,
          hostObjectUniversalIdentifier: OBJECT,
          relationTargetObjectUniversalIdentifier:
            standardRelationObjectUniversalIdentifier,
        }),
      );
    },
  );
});
