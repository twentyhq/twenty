import type ts from 'typescript';

import { type IconDocumentationGroup } from './IconDocumentationGroup';

const SHARED_SVG_PROPS = new Set(['size', 'stroke', 'color', 'title']);

export const getIconDocumentationGroups = ({
  checker,
  icons,
}: {
  checker: ts.TypeChecker;
  icons: { name: string; symbol: ts.Symbol }[];
}): IconDocumentationGroup[] => {
  const groups = new Map<string, IconDocumentationGroup>();

  for (const { name, symbol } of icons) {
    const declaration = symbol.valueDeclaration;

    if (!declaration) {
      throw new Error(`Could not find the declaration for ${name}`);
    }

    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const propsParameter = type.getCallSignatures()[0]?.getParameters()[0];

    if (!propsParameter) {
      throw new Error(`Could not read icon props for ${name}`);
    }

    const supportsSvgAttributes = declaration
      .getSourceFile()
      .fileName.includes('/node_modules/@tabler/');
    const props = checker
      .getTypeOfSymbolAtLocation(propsParameter, declaration)
      .getProperties()
      .filter(
        (prop) => !supportsSvgAttributes || SHARED_SVG_PROPS.has(prop.name),
      )
      .map((prop) => prop.name)
      .sort();
    const key = JSON.stringify({ props, supportsSvgAttributes });
    const group = groups.get(key) ?? {
      names: [],
      props,
      supportsSvgAttributes,
    };

    group.names.push(name);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => ({ ...group, names: group.names.sort() }))
    .sort((left, right) => left.names[0].localeCompare(right.names[0], 'en'));
};
