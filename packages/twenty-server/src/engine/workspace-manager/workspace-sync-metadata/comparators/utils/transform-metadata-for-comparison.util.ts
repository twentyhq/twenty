import { orderObjectProperties } from './order-object-properties.util';

type TransformToString<T, Keys extends keyof T> = {
  [P in keyof T]: P extends Keys ? string : T[P];
};

type TransformMetadataForComparisonFn = {
  // Overload for an array of T
  <T, Keys extends keyof T>(
    fieldMetadataCollection: T[],
    options: {
      shouldIgnoreProperty?: (
        property: string,
        originalMetadata?: T,
      ) => boolean;
      propertiesToStringify?: readonly Keys[];
      keyFactory: (datum: T) => string;
    },
  ): Record<string, TransformToString<T, Keys>>;

  // Overload for a single T object
  <T, Keys extends keyof T>(
    fieldMetadataCollection: T,
    options: {
      shouldIgnoreProperty?: (
        property: string,
        originalMetadata?: T,
      ) => boolean;
      propertiesToStringify?: readonly Keys[];
    },
  ): TransformToString<T, Keys>;
};

export const transformMetadataForComparison = (<T, Keys extends keyof T>(
  metadata: T[] | T,
  options: {
    shouldIgnoreProperty?: (property: string, originalMetadata?: T) => boolean;
    propertiesToStringify?: readonly Keys[];
    keyFactory?: (datum: T) => string;
  },
): Record<string, TransformToString<T, Keys>> | TransformToString<T, Keys> => {
  const propertiesToStringify = (options.propertiesToStringify ??
    []) as readonly string[];

  const transformProperties = (datum: T): TransformToString<T, Keys> => {
    const transformedField = {} as TransformToString<T, Keys>;

    for (const property in datum) {
      if (
        options.shouldIgnoreProperty &&
        options.shouldIgnoreProperty(property, datum)
      ) {
        continue;
      }
      if (
        propertiesToStringify.includes(property) &&
        datum[property] !== null &&
        typeof datum[property] === 'object'
      ) {
        const orderedValue = orderObjectProperties(datum[property] as object);

        transformedField[property as string] = JSON.stringify(
          orderedValue,
        ) as T[Keys];
      } else {
        transformedField[property as string] = datum[property];
      }
    }

    return transformedField;
  };

  if (Array.isArray(metadata)) {
    return metadata.reduce<Record<string, TransformToString<T, Keys>>>(
      (acc, datum) => {
        const key = options.keyFactory?.(datum);

        if (!key) {
          throw new Error('keyFactory must be implemented');
        }

        acc[key] = transformProperties(datum);

        return acc;
      },
      {},
    );
  }

  return transformProperties(metadata);
}) as TransformMetadataForComparisonFn;
