import type ts from 'typescript';

import { getIconProps } from './getIconProps';
import { type IconDocumentationGroup } from './IconDocumentationGroup';

export const getIconDocumentationGroups = ({
  checker,
  icons,
}: {
  checker: ts.TypeChecker;
  icons: { name: string; symbol: ts.Symbol }[];
}): IconDocumentationGroup[] => {
  const groups = new Map<string, IconDocumentationGroup>();

  for (const { name, symbol } of icons) {
    const { props, supportsSvgAttributes } = getIconProps({
      checker,
      name,
      symbol,
    });
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
    .sort(({ names: [leftFirstName = ''] }, { names: [rightFirstName = ''] }) =>
      leftFirstName.localeCompare(rightFirstName, 'en'),
    );
};
