import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ComponentStorybookLayout.module.scss';

type ComponentStorybookLayoutProps = {
  width?: number;
  backgroundColor?: string | undefined;
  height?: number;
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({
  width,
  backgroundColor,
  height,
  children,
}: ComponentStorybookLayoutProps) => {
  return (
    <div
      className={styles.layout}
      style={{
        // background falls back to the SCSS default when undefined
        background: backgroundColor,
        height: isDefined(height) ? `${height}px` : 'fit-content',
        minWidth: width ? 'unset' : '300px',
        width: width ? `${width}px` : 'fit-content',
      }}
    >
      {children}
    </div>
  );
};
