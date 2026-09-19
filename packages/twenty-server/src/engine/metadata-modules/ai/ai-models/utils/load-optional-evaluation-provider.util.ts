type EvaluationProviderFactory = (options: {
  apiKey?: string;
  baseURL?: string;
}) => unknown;

type EvaluationProviderPackage = {
  npm: string;
  factoryName: string;
};

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
  } catch {
    return undefined;
  }
};
