// read by name: the declared field can be one an app added, which the standard entity type does not list
export const getPersonFieldValue = ({
  person,
  fieldName,
}: {
  person: object;
  fieldName: string;
}): unknown => Object.fromEntries(Object.entries(person))[fieldName];
