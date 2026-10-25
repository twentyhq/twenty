export const AI_DATA_RESIDENCY_POLICIES = ['eu'] as const;

export type AiDataResidencyPolicy = (typeof AI_DATA_RESIDENCY_POLICIES)[number];
