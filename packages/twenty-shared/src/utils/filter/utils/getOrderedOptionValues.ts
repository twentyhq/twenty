export const getOrderedOptionValues = (
  options: { value: string; position: number }[] | null | undefined,
): string[] =>
  [...(options ?? [])]
    .sort((optionA, optionB) => optionA.position - optionB.position)
    .map((option) => option.value);
