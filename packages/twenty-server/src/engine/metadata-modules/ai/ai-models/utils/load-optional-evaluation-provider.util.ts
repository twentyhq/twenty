type EvaluationProviderFactory = (options: {
  apiKey?: string;
  baseURL?: string;
}) => unknown;

type EvaluationProviderPackage = {
  npm: string;
  factoryName: string;
};

const isModuleNotFoundError = (error: unknown, npm: string): boolean =>
  (error as NodeJS.ErrnoException)?.code === 'MODULE_NOT_FOUND' &&
  // A package that is installed but whose own imports are broken throws the
  // same code, so only a miss on the package itself counts as "not installed".
  String((error as Error)?.message ?? '').includes(npm);

// Evaluation providers ship as optional peers: an instance that never runs a
// classification step should not carry the dependency, and a self-hoster who
// wants one installs it. Resolved at call time rather than imported so a missing
// package degrades to "model unavailable" instead of failing boot.
export const loadOptionalEvaluationProviderFactory = ({
  npm,
  factoryName,
}: EvaluationProviderPackage): EvaluationProviderFactory | undefined => {
  try {
    const providerModule: Record<string, unknown> = require(npm);
    const factory = providerModule[factoryName];

    return typeof factory === 'function'
      ? (factory as EvaluationProviderFactory)
      : undefined;
  } catch (error) {
    if (isModuleNotFoundError(error, npm)) {
      return undefined;
    }

    // An installed package that fails to initialise is a different problem from
    // an absent one, and reporting it as absent would send an operator looking
    // for a dependency that is already there.
    throw error;
  }
};
