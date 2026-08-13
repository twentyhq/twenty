import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSkillUniversalIdentifier = ({
  applicationUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'skill',
    value: name,
    applicationUniversalIdentifier,
  });
