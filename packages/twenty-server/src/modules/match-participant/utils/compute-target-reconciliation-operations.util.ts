import { isDefined } from 'twenty-shared/utils';

export type TargetIdentity = {
  parentId: string;
  targetPersonId: string | null;
  targetCompanyId: string | null;
  targetOpportunityId: string | null;
};

export type ExistingTarget = TargetIdentity & {
  id: string;
  deletedAt: Date | string | null;
  isAutomaticallyAssigned: boolean;
  isManuallyAssigned: boolean;
};

type TargetReconciliationOperations = {
  targetsToCreate: TargetIdentity[];
  targetsToMarkAutomatic: string[];
  targetsToMarkNotAutomatic: string[];
  targetIdsToDelete: string[];
};

const getTargetIdentityKey = ({
  parentId,
  targetPersonId,
  targetCompanyId,
  targetOpportunityId,
}: TargetIdentity) =>
  [
    parentId,
    targetPersonId ?? '',
    targetCompanyId ?? '',
    targetOpportunityId ?? '',
  ].join(':');

export const computeTargetReconciliationOperations = ({
  desiredTargets,
  existingTargets,
}: {
  desiredTargets: TargetIdentity[];
  existingTargets: ExistingTarget[];
}): TargetReconciliationOperations => {
  const desiredTargetByKey = new Map(
    desiredTargets.map((target) => [getTargetIdentityKey(target), target]),
  );
  const liveTargetByKey = new Map(
    existingTargets
      .filter((target) => !isDefined(target.deletedAt))
      .map((target) => [getTargetIdentityKey(target), target]),
  );
  const tombstoneKeys = new Set(
    existingTargets
      .filter((target) => isDefined(target.deletedAt))
      .map(getTargetIdentityKey),
  );

  const targetsToCreate = [...desiredTargetByKey.entries()]
    .filter(([key]) => !liveTargetByKey.has(key) && !tombstoneKeys.has(key))
    .map(([, target]) => target);

  const targetsToMarkAutomatic = [...desiredTargetByKey.keys()]
    .map((key) => liveTargetByKey.get(key))
    .filter(isDefined)
    .filter((target) => !target.isAutomaticallyAssigned)
    .map((target) => target.id);

  const obsoleteLiveTargets = [...liveTargetByKey.entries()]
    .filter(([key]) => !desiredTargetByKey.has(key))
    .map(([, target]) => target);

  return {
    targetsToCreate,
    targetsToMarkAutomatic,
    targetsToMarkNotAutomatic: obsoleteLiveTargets
      .filter(
        (target) => target.isAutomaticallyAssigned && target.isManuallyAssigned,
      )
      .map((target) => target.id),
    targetIdsToDelete: obsoleteLiveTargets
      .filter((target) => !target.isManuallyAssigned)
      .map((target) => target.id),
  };
};
