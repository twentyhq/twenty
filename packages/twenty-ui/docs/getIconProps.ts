import type ts from 'typescript';

import { isDefined } from '../src/utilities/utils/isDefined';

const SHARED_SVG_PROPS = new Set(['size', 'stroke', 'color', 'title']);

export const getIconProps = ({
  checker,
  name,
  symbol,
}: {
  checker: ts.TypeChecker;
  name: string;
  symbol: ts.Symbol;
}): { props: string[]; supportsSvgAttributes: boolean } => {
  const declaration = symbol.valueDeclaration;

  if (!isDefined(declaration)) {
    throw new Error(`Could not find the declaration for ${name}`);
  }

  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const propsParameter = type.getCallSignatures()[0]?.getParameters()[0];

  if (!isDefined(propsParameter)) {
    throw new Error(`Could not read icon props for ${name}`);
  }

  const supportsSvgAttributes = declaration
    .getSourceFile()
    .fileName.includes('/node_modules/@tabler/');
  const props = checker
    .getTypeOfSymbolAtLocation(propsParameter, declaration)
    .getProperties()
    .filter((prop) => !supportsSvgAttributes || SHARED_SVG_PROPS.has(prop.name))
    .map((prop) => prop.name)
    .sort();

  return { props, supportsSvgAttributes };
};
