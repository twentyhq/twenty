import type { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const getFailureIdentifier = (failure: {
  flatEntityMinimalInformation?: Partial<Record<string, unknown>>;
}): string | undefined => {
  const info = failure.flatEntityMinimalInformation;

  if (!info) {
    return undefined;
  }

  return (
    (info.name as string | undefined) ??
    (info.nameSingular as string | undefined) ??
    (info.label as string | undefined) ??
    (info.id as string | undefined)
  );
};

export const formatValidationErrors = (
  error: WorkspaceMigrationBuilderException,
): string => {
  const report = error.failedWorkspaceMigrationBuildResult.report;
  const grouped = new Map<string, string[]>();

  for (const [entityType, failures] of Object.entries(report)) {
    if (!Array.isArray(failures) || failures.length === 0) {
      continue;
    }

    for (const failure of failures) {
      if (!failure.errors || !Array.isArray(failure.errors)) {
        continue;
      }

      const identifier = getFailureIdentifier(failure);

      for (const validationError of failure.errors) {
        const message = validationError.message || validationError.code;
        const key = `[${entityType}] ${message}`;
        const existing = grouped.get(key) ?? [];

        if (identifier) {
          existing.push(identifier);
        }
        grouped.set(key, existing);
      }
    }
  }

  if (grouped.size === 0) {
    return error.message;
  }

  const lines: string[] = [];

  for (const [message, identifiers] of grouped) {
    if (identifiers.length > 1) {
      lines.push(`${message} (${identifiers.join(', ')})`);
    } else if (identifiers.length === 1) {
      lines.push(`${message} (${identifiers[0]})`);
    } else {
      lines.push(message);
    }
  }

  return `Validation errors:\n${lines.join('\n')}`;
};
