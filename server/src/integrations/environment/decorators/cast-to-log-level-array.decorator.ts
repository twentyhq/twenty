import { Transform } from 'class-transformer';

export function CastToLogLevelArray() {
  return Transform(({ value }: { value: string }) => toLogLevelArray(value));
}

const toLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const rawLogLevels = value.split(',').map((level) => level.trim());
    const isInvalid = rawLogLevels.some(
      (level) => !['log', 'error', 'warn', 'debug', 'verbose'].includes(level),
    );

    if (!isInvalid) {
      return rawLogLevels;
    }
  }

  return undefined;
};
