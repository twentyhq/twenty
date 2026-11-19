import { getJobConfigManifestErrors } from '@/application/utils/getJobConfigManifestErrors';
import { type JobConfigManifest } from '@/application/jobConfigManifestType';
import { type LogicFunctionManifest } from '@/application/logicFunctionManifestType';

export const getJobConfigsManifestErrors = ({
  jobConfigs,
  logicFunctions,
}: {
  jobConfigs: JobConfigManifest[];
  logicFunctions: Pick<
    LogicFunctionManifest,
    'universalIdentifier' | 'jobConfigKeys'
  >[];
}): string[] => {
  const errors = jobConfigs.flatMap(getJobConfigManifestErrors);
  const jobConfigKeys = new Set<string>();

  for (const { key } of jobConfigs) {
    if (jobConfigKeys.has(key)) {
      errors.push(`Job config key "${key}" is declared more than once`);
    }

    jobConfigKeys.add(key);
  }

  for (const logicFunction of logicFunctions) {
    for (const jobConfigKey of logicFunction.jobConfigKeys ?? []) {
      if (!jobConfigKeys.has(jobConfigKey)) {
        errors.push(
          `Logic function ${logicFunction.universalIdentifier} references the unknown job config key "${jobConfigKey}"`,
        );
      }
    }
  }

  return errors;
};
