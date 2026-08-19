import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A timeline activity rule is keyed by the relation it walks, or by the object
// itself for the self rule.
export const getTimelineActivityRuleUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  relationFieldMetadataUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  relationFieldMetadataUniversalIdentifier: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'timelineActivityRule',
    value:
      relationFieldMetadataUniversalIdentifier ??
      objectMetadataUniversalIdentifier,
    applicationUniversalIdentifier,
  });
