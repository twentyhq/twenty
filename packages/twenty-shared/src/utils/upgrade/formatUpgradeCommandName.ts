const TRAILING_TIMESTAMP_PATTERN = /^\d+$/;

const getCommandKindLabel = (className: string): string => {
  if (className.endsWith('FastInstanceCommand')) {
    return '(instance fast)';
  }

  if (className.endsWith('SlowInstanceCommand')) {
    return '(instance slow)';
  }

  return '(workspace)';
};

const stripCommandSuffix = (className: string): string =>
  className
    .replace(/FastInstanceCommand$/, '')
    .replace(/SlowInstanceCommand$/, '')
    .replace(/Command$/, '');

export const formatUpgradeCommandName = (commandName: string): string => {
  const commandNameParts = commandName.split('_');

  if (commandNameParts.length < 3) {
    return commandName;
  }

  const version = commandNameParts[0];
  const lastPart = commandNameParts[commandNameParts.length - 1];
  const hasTrailingTimestamp = TRAILING_TIMESTAMP_PATTERN.test(lastPart);

  const className = commandNameParts.slice(1, -1).join('_');
  const friendlyCommandName = stripCommandSuffix(className);
  const kindLabel = getCommandKindLabel(className);

  if (hasTrailingTimestamp) {
    return `${friendlyCommandName} ${lastPart} (${version}) ${kindLabel}`;
  }

  return `${friendlyCommandName} (${version}) ${kindLabel}`;
};
