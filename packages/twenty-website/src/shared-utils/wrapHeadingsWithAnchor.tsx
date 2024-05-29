import React, {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';

export const wrapHeadingsWithAnchor = (children: ReactNode): ReactNode => {
  const hasChildren = (
    element: ReactElement,
  ): element is ReactElement<{ children: ReactNode }> => {
    return element.props.children !== undefined;
  };

  return Children.map(children, (child) => {
    if (
      isValidElement(child) &&
      typeof child.type === 'string' &&
      ['h1', 'h2', 'h3', 'h4'].includes(child.type)
    ) {
      const id = child.props.children
        .toString()
        .replace(/\s+/g, '-')
        .toLowerCase();
      return cloneElement(child as ReactElement<any>, {
        id: id,
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
