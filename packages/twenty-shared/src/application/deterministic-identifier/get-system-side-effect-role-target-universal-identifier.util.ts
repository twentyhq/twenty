import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getSystemSideEffectRoleTargetUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  targetId,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  targetId: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'roleTarget',
    value: `${roleUniversalIdentifier}:${targetId}`,
    applicationUniversalIdentifier,
  });
