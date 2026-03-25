import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

export const wrapHeadingsWithAnchor = (children: ReactNode): ReactNode => {
  const hasChildren = (
    element: ReactElement,
  ): element is ReactElement<{ children: ReactNode }> => {
    return element.props.children !== undefined;
  };
  const idCounts = new Map<string, number>();

  return Children.map(children, (child) => {
    if (
      isValidElement(child) &&
      typeof child.type === 'string' &&
      ['h1', 'h2', 'h3', 'h4'].includes(child.type)
    ) {
      const baseId = child.props.children
        .toString()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const idCount = idCounts.get(baseId) ?? 0;

      const id = idCount === 0 ? baseId : `${baseId}-${idCount}`;
      idCounts.set(baseId, idCount + 1);

      return cloneElement(child as ReactElement<any>, {
        id,
        className: 'anchor',
        children: <a href={`#${id}`}>{child.props.children}</a>,
      });
    }

    if (isValidElement(child) && hasChildren(child)) {
      return cloneElement(child, {
        children: wrapHeadingsWithAnchor(child.props.children),
      });
    }

    return child;
  });
};
