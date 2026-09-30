import { useRender } from '@base-ui/react/use-render';
import { isString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Breadcrumb.module.scss';
import { type BreadcrumbItem } from '../types/BreadcrumbItem';

type BreadcrumbItemContentProps = BreadcrumbItem & {
  current: boolean;
};

export const BreadcrumbItemContent = ({
  children,
  href,
  render,
  title,
  current,
}: BreadcrumbItemContentProps) => {
  return useRender({
    defaultTagName: isDefined(href) ? 'a' : 'span',
    render,
    props: {
      children,
      href,
      title: title ?? (isString(children) ? children : undefined),
      'aria-current': current ? 'page' : undefined,
      'data-linked': isDefined(href) || undefined,
      className: styles.content,
    },
  });
};
