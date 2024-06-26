export const DEFAULT_LABEL_IDENTIFIER_FIELD_NAME = 'name';

export const SPECIAL_LABEL_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME: Record<
  string,
  string[]
> = {
  person: ['nameFirstName', 'nameLastName'],
};

export const IMAGE_IDENTIFIER_FIELD_NAMES_BY_STANDARD_OBJECT_NAME: Record<
  string,
  string[]
> = {
  company: ['domainName'],
};
