export const getClassificationOutputSchema = () => ({
  category: {
    isLeaf: true as const,
    type: 'string' as const,
    label: 'Category',
    value: '',
  },
  probability: {
    isLeaf: true as const,
    type: 'number' as const,
    label: 'Category probability (if available)',
    value: 0.9,
  },
  probabilities: {
    isLeaf: true as const,
    type: 'array' as const,
    label: 'Category probabilities (if available)',
    value: [],
  },
  modelId: {
    isLeaf: true as const,
    type: 'string' as const,
    label: 'Model',
    value: '',
  },
  resolvedModelId: {
    isLeaf: true as const,
    type: 'string' as const,
    label: 'Resolved model',
    value: '',
  },
});
