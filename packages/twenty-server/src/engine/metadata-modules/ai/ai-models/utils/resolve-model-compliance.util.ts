import { type DataResidency } from 'twenty-shared/ai';

type ModelCompliance = {
  dataResidency?: DataResidency;
  zeroDataRetention?: boolean;
};

// The two fields resolve differently on purpose. Residency falls back to the
// provider because one credential usually means one location — but not always:
// a Bedrock provider pinned to eu-west-3 fronts both eu.* routes that stay in
// the EU and global.* ones that do not, so a model may override it. Retention
// has no fallback at all; it is agreed per model deployment, and the provider
// schema does not even carry it, so a claim written at that level is dropped
// rather than lent to every model beneath it.
export const resolveModelCompliance = (
  modelDef: ModelCompliance,
  providerConfig: Pick<ModelCompliance, 'dataResidency'>,
): ModelCompliance => ({
  dataResidency: modelDef.dataResidency ?? providerConfig.dataResidency,
  zeroDataRetention: modelDef.zeroDataRetention,
});
