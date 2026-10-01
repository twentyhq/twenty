type ViewDateFieldInput = {
  startFieldMetadataId?: string | null;
  endFieldMetadataId?: string | null;
  calendarFieldMetadataId?: string | null;
  calendarEndFieldMetadataId?: string | null;
};

// TODO: remove with the deprecated calendar*FieldMetadataId input fields (2.46).
export const resolveDeprecatedViewDateFieldInput = <
  TInput extends ViewDateFieldInput,
>({
  calendarFieldMetadataId,
  calendarEndFieldMetadataId,
  ...input
}: TInput): Omit<
  TInput,
  'calendarFieldMetadataId' | 'calendarEndFieldMetadataId'
> => ({
  ...input,
  ...(input.startFieldMetadataId === undefined &&
  calendarFieldMetadataId !== undefined
    ? { startFieldMetadataId: calendarFieldMetadataId }
    : {}),
  ...(input.endFieldMetadataId === undefined &&
  calendarEndFieldMetadataId !== undefined
    ? { endFieldMetadataId: calendarEndFieldMetadataId }
    : {}),
});
