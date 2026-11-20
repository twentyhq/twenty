import { type JobGroupManifest } from '@/application/jobGroupManifestType';
import { type LogicFunctionManifest } from '@/application/logicFunctionManifestType';
import { getJobGroupManifestErrors } from '@/application/utils/getJobGroupManifestErrors';

export const getJobGroupsManifestErrors = ({
  jobGroups,
  logicFunctions,
}: {
  jobGroups: JobGroupManifest[];
  logicFunctions: Pick<
    LogicFunctionManifest,
    'universalIdentifier' | 'jobGroupUniversalIdentifiers'
  >[];
}): string[] => {
  const errors = jobGroups.flatMap(getJobGroupManifestErrors);
  const jobGroupUniversalIdentifiers = new Set<string>();

  for (const { universalIdentifier } of jobGroups) {
    if (jobGroupUniversalIdentifiers.has(universalIdentifier)) {
      errors.push(
        `Job group ${universalIdentifier} is declared more than once`,
      );
    }

    jobGroupUniversalIdentifiers.add(universalIdentifier);
  }

  for (const logicFunction of logicFunctions) {
    for (const jobGroupUniversalIdentifier of logicFunction.jobGroupUniversalIdentifiers ??
      []) {
      if (!jobGroupUniversalIdentifiers.has(jobGroupUniversalIdentifier)) {
        errors.push(
          `Logic function ${logicFunction.universalIdentifier} references the unknown job group ${jobGroupUniversalIdentifier}`,
        );
      }
    }
  }

  return errors;
};
