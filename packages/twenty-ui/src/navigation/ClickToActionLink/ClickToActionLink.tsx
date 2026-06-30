import { clsx } from 'clsx';
import React from 'react';

import styles from './ClickToActionLink.module.scss';

type ClickToActionLinkProps = React.ComponentProps<'a'> & {
  className?: string;
};

export const ClickToActionLink = (props: ClickToActionLinkProps) => {
  return (
    <a
      className={clsx(styles.root, props.className)}
      href={props.href}
      onClick={props.onClick}
      target={props.target}
      rel={props.rel}
    >
      {props.children}
    </a>
  );
};
