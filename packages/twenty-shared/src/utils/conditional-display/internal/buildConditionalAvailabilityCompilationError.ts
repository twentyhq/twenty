export const buildConditionalAvailabilityCompilationError = ({
  expression,
  reason,
}: {
  expression: string;
  reason: string;
}): Error =>
  new Error(
    `Cannot compile conditional availability expression "${expression}": ${reason}`,
  );
