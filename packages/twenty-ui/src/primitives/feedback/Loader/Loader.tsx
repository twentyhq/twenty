import { type ThemeColor, themeCssVariables } from '@ui/theme';

import styles from './Loader.module.scss';

type LoaderProps = {
  color?: ThemeColor;
};

export const Loader = ({ color }: LoaderProps) => {
  return (
    <div
      className={styles.container}
      style={
        color
          ? ({
              '--loader-color': themeCssVariables.tag.text[color],
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.dot} />
    </div>
  );
};
