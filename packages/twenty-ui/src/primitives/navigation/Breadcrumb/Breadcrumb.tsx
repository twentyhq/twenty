import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { BreadcrumbItemContent } from './internal/BreadcrumbItemContent';
import { type BreadcrumbProps } from './types/BreadcrumbProps';

import styles from './Breadcrumb.module.scss';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const Breadcrumb = ({
  links,
  className,
  render,
  ref,
  'aria-label': ariaLabel = doNotTranslate('Breadcrumb'),
  ...props
}: BreadcrumbProps) => {
  return useRender({
    defaultTagName: 'nav',
    render,
    ref,
    props: {
      ...props,
      'aria-label': ariaLabel,
      className: clsx(styles.root, className),
      children: (
        <ol className={styles.list}>
          {links.map((link, index) => (
            <li className={styles.item} key={index}>
              {index > 0 && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
              <BreadcrumbItemContent
                {...link}
                current={index === links.length - 1}
              />
            </li>
          ))}
        </ol>
      ),
    },
  });
};
