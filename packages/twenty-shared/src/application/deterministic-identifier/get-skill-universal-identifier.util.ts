import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A skill is identified by its name within its application.
export const getSkillUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  name,
}: {
  ownerApplicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'skill',
    value: name,
    applicationUniversalIdentifier: ownerApplicationUniversalIdentifier,
  });
