import { type LightIconButtonGroupProps } from './types/LightIconButtonGroupProps';

import { LightIconButton } from '@ui/components/LightIconButton/LightIconButton';
import { clsx } from 'clsx';

import styles from './LightIconButtonGroup.module.scss';

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
