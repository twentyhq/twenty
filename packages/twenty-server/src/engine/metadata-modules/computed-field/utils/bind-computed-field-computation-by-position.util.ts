import {
  type FieldMetadataComputation,
  type FieldMetadataComputationBindings,
} from 'twenty-shared/types';
import {
  isDefined,
  tokenizeValidationRuleExpression,
} from 'twenty-shared/utils';

const getExpressionPaths = (expression: string | undefined): string[] =>
  isDefined(expression)
    ? tokenizeValidationRuleExpression(expression).flatMap((token) =>
        token.type === 'path' ? [token.text] : [],
      )
    : [];

// A computation written with names its fields no longer have cannot be bound by name.
// Each of its paths takes the binding of the path at the same place in a bound computation.
export const bindComputedFieldComputationByPosition = ({
  computation,
  boundComputation,
}: {
  computation: FieldMetadataComputation;
  boundComputation: FieldMetadataComputation;
}): FieldMetadataComputation => {
  const { bindings: boundBindings } = boundComputation;

  if (!isDefined(boundBindings)) {
    return computation;
  }

  const bindPaths = ({
    paths,
    boundPaths,
    pathPrefix,
    boundPathPrefix,
  }: {
    paths: string[];
    boundPaths: string[];
    pathPrefix: string[];
    boundPathPrefix: string[];
  }): [string, string][] =>
    paths.flatMap((path, pathIndex) => {
      const segments = path.split('.');
      const boundSegments = boundPaths[pathIndex]?.split('.') ?? [];

      return segments.flatMap((_segment, index): [string, string][] => {
        const boundUniversalIdentifier =
          boundBindings[
            [...boundPathPrefix, ...boundSegments.slice(0, index + 1)].join('.')
          ];

        return isDefined(boundUniversalIdentifier) &&
          index < boundSegments.length
          ? [
              [
                [...pathPrefix, ...segments.slice(0, index + 1)].join('.'),
                boundUniversalIdentifier,
              ],
            ]
          : [];
      });
    });

  const buildBindings = (): FieldMetadataComputationBindings => {
    if (computation.kind === 'FORMULA' && boundComputation.kind === 'FORMULA') {
      return Object.fromEntries(
        bindPaths({
          paths: getExpressionPaths(computation.expression),
          boundPaths: getExpressionPaths(boundComputation.expression),
          pathPrefix: [],
          boundPathPrefix: [],
        }),
      );
    }

    if (computation.kind !== 'ROLLUP' || boundComputation.kind !== 'ROLLUP') {
      return {};
    }

    return Object.fromEntries([
      ...bindPaths({
        paths: [computation.relationFieldName],
        boundPaths: [boundComputation.relationFieldName],
        pathPrefix: [],
        boundPathPrefix: [],
      }),
      ...(['expression', 'filter'] as const).flatMap((property) =>
        bindPaths({
          paths: getExpressionPaths(computation[property]),
          boundPaths: getExpressionPaths(boundComputation[property]),
          pathPrefix: [computation.relationFieldName],
          boundPathPrefix: [boundComputation.relationFieldName],
        }),
      ),
    ]);
  };

  return { ...computation, bindings: buildBindings() };
};
