import { isDefined } from 'twenty-shared/utils';

type EnumOption = {
  id?: string;
  value: string;
};

export type EnumOptionsChangePlan =
  | { kind: 'rebuild' }
  | {
      kind: 'inPlace';
      renamedValues: Array<{ fromValue: string; toValue: string }>;
      addedValues: Array<{ value: string; beforeValue?: string }>;
      removedValues: string[];
    };

export const getRemovedEnumOptionValues = ({
  fromOptions,
  toOptions,
}: {
  fromOptions: EnumOption[];
  toOptions: EnumOption[];
}): string[] => {
  const toOptionIds = new Set(toOptions.map((option) => option.id));
  const toValues = new Set(toOptions.map((option) => option.value));

  return fromOptions
    .filter((option) => !isDefined(option.id) || !toOptionIds.has(option.id))
    .map((option) => option.value)
    .filter((value) => !toValues.has(value));
};

const isInSameOrder = (values: string[], orderedValues: string[]): boolean =>
  values.every(
    (value, index) =>
      index === 0 ||
      orderedValues.indexOf(values[index - 1]) < orderedValues.indexOf(value),
  );

// Removed values stay in the Postgres type: dropping one needs a full column rewrite.
export const planEnumOptionsChange = ({
  fromOptions,
  toOptions,
  existingEnumValues,
}: {
  fromOptions: EnumOption[];
  toOptions: EnumOption[];
  existingEnumValues: string[];
}): EnumOptionsChangePlan => {
  const fromOptionsById = new Map(
    fromOptions
      .filter((option) => isDefined(option.id))
      .map((option) => [option.id, option]),
  );

  const renamedValues = toOptions.flatMap((toOption) => {
    const fromOption = isDefined(toOption.id)
      ? fromOptionsById.get(toOption.id)
      : undefined;

    return isDefined(fromOption) && fromOption.value !== toOption.value
      ? [{ fromValue: fromOption.value, toValue: toOption.value }]
      : [];
  });

  const hasUnsafeRename = renamedValues.some(
    ({ fromValue, toValue }) =>
      !existingEnumValues.includes(fromValue) ||
      existingEnumValues.includes(toValue) ||
      toOptions.some((option) => option.value === fromValue),
  );

  if (hasUnsafeRename) {
    return { kind: 'rebuild' };
  }

  const toValueByFromValue = new Map(
    renamedValues.map(({ fromValue, toValue }) => [fromValue, toValue]),
  );
  const renamedEnumValues = existingEnumValues.map(
    (value) => toValueByFromValue.get(value) ?? value,
  );
  const finalEnumValues = [...renamedEnumValues];
  const addedValues: Array<{ value: string; beforeValue?: string }> = [];

  toOptions.forEach((toOption, index) => {
    if (finalEnumValues.includes(toOption.value)) {
      return;
    }

    const beforeValue = toOptions
      .slice(index + 1)
      .map((option) => option.value)
      .find((value) => renamedEnumValues.includes(value));

    if (isDefined(beforeValue)) {
      finalEnumValues.splice(
        finalEnumValues.indexOf(beforeValue),
        0,
        toOption.value,
      );
    } else {
      finalEnumValues.push(toOption.value);
    }

    addedValues.push({ value: toOption.value, beforeValue });
  });

  if (
    !isInSameOrder(
      toOptions.map((option) => option.value),
      finalEnumValues,
    )
  ) {
    return { kind: 'rebuild' };
  }

  return {
    kind: 'inPlace',
    renamedValues,
    addedValues,
    removedValues: getRemovedEnumOptionValues({ fromOptions, toOptions }),
  };
};
