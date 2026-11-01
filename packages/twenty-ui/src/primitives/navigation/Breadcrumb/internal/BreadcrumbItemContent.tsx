import { useRender } from '@base-ui/react/use-render';
import { isString } from '@sniptt/guards';
import { clsx } from 'clsx';

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
  className,
  ref,
  'aria-current': ariaCurrent = current ? 'page' : undefined,
  ...props
}: BreadcrumbItemContentProps) => {
  return useRender({
    defaultTagName: isDefined(href) ? 'a' : 'span',
    render,
    ref,
    props: {
      ...props,
      children,
      href,
      title: title ?? (isString(children) ? children : undefined),
      'aria-current': ariaCurrent,
      'data-linked': isDefined(href) || undefined,
      className: clsx(styles.content, className),
    },
  });
};
