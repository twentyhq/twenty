import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
} from 'react';

import { type IconComponent } from '@ui/icon';

import { clsx } from 'clsx';
import {
  LightIconButton,
  type LightIconButtonProps,
} from '@ui/input/LightIconButton/LightIconButton';

import styles from './LightIconButtonGroup.module.scss';

export type LightIconButtonGroupProps = Pick<
  LightIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
    Icon: IconComponent;
    accent?: LightIconButtonProps['accent'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onClick?: (event: MouseEvent<any>) => void;
    disabled?: boolean;
    ariaLabel?: string;
    dataTestId?: string;
  }[];
};

export const LightIconButtonGroup = ({
  iconButtons,
  size,
  className,
}: LightIconButtonGroupProps) => (
  <div className={clsx(styles.container, className)}>
    {iconButtons.map(
      ({ Wrapper, Icon, accent, onClick, ariaLabel, dataTestId }, index) => {
        const iconButton = (
          <LightIconButton
            key={`light-icon-button-${index}`}
            Icon={Icon}
            accent={accent}
            disabled={!onClick}
            onClick={onClick}
            size={size}
            aria-label={ariaLabel}
            testId={dataTestId}
          />
        );

        return Wrapper ? (
          <Wrapper
            key={`light-icon-button-wrapper-${index}`}
            iconButton={iconButton}
          />
        ) : (
          iconButton
        );
      },
    )}
  </div>
);
