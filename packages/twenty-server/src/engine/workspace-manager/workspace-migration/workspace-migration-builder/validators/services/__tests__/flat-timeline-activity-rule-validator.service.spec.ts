import { RelationType } from 'twenty-shared/types';

import { FlatTimelineActivityRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-timeline-activity-rule-validator.service';

const RULE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000a1';
const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-0000000000c1';

const mapsFrom = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildRule = ({
  relationFieldMetadataUniversalIdentifier = null,
  actions = ['created', 'updated', 'deleted', 'restored'],
}: {
  relationFieldMetadataUniversalIdentifier?: string | null;
  actions?: string[];
} = {}) => ({
  universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  relationFieldMetadataUniversalIdentifier,
  resolution: 'MATERIALIZED',
  actions,
  triggerFieldMetadataIds: null,
  isActive: true,
});

const buildCreationArgs = ({
  isAuditLogged = true,
  isSystem = false,
  relationFieldMetadataUniversalIdentifier = null,
  actions,
}: {
  isAuditLogged?: boolean;
  isSystem?: boolean;
  relationFieldMetadataUniversalIdentifier?: string | null;
  actions?: string[];
} = {}) =>
  ({
    flatEntityToValidate: buildRule({
      relationFieldMetadataUniversalIdentifier,
      actions,
    }),
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatTimelineActivityRuleMaps: mapsFrom([]),
      flatObjectMetadataMaps: mapsFrom([
        {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          isAuditLogged,
          isSystem,
        },
      ]),
      flatFieldMetadataMaps: mapsFrom([
        {
          universalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          type: 'RELATION',
          universalSettings: { relationType: RelationType.MANY_TO_ONE },
        },
      ]),
    },
  }) as unknown as Parameters<
    FlatTimelineActivityRuleValidatorService['validateFlatTimelineActivityRuleCreation']
  >[0];

describe('FlatTimelineActivityRuleValidatorService', () => {
  let service: FlatTimelineActivityRuleValidatorService;

  beforeEach(() => {
    service = new FlatTimelineActivityRuleValidatorService();
  });

  describe('self rule creation', () => {
    it('should accept a self rule on an audit logged non system object', () => {
      const result =
        service.validateFlatTimelineActivityRuleCreation(buildCreationArgs());

      expect(result.errors).toHaveLength(0);
    });

    it('should reject a self rule on a non audit logged object', () => {
      const result = service.validateFlatTimelineActivityRuleCreation(
        buildCreationArgs({ isAuditLogged: false }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe(
        'This object does not record timeline activities',
      );
    });

    it('should reject a self rule on a system object', () => {
      const result = service.validateFlatTimelineActivityRuleCreation(
        buildCreationArgs({ isSystem: true }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe(
        'This object does not record timeline activities',
      );
    });

    it('should reject a self rule emitting linked entries', () => {
      const result = service.validateFlatTimelineActivityRuleCreation(
        buildCreationArgs({ actions: ['linked'] }),
      );

      expect(result.errors).toHaveLength(1);
    });
  });

  describe('relation rule creation', () => {
    it('should not apply the self rule object constraint to a relation rule', () => {
      const result = service.validateFlatTimelineActivityRuleCreation(
        buildCreationArgs({
          isAuditLogged: false,
          relationFieldMetadataUniversalIdentifier:
            RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          actions: ['linked', 'unlinked'],
        }),
      );

      expect(result.errors).toHaveLength(0);
    });
  });
});
