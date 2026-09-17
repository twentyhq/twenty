import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { type MenuItemIconButton } from '@ui/primitives/navigation/MenuItem/types/MenuItemIconButton';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './MenuItemActions.module.scss';

type MenuItemActionsProps = {
  iconButtons: MenuItemIconButton[];
  className?: string;
};

export const MenuItemActions = ({
  iconButtons,
  className,
}: MenuItemActionsProps) => (
  <ButtonGroup attached={false} size="sm" variant="ghost" className={className}>
    {iconButtons.map(
      (
        {
          Wrapper,
          Icon,
          accent = 'secondary',
          onClick,
          disabled,
          ariaLabel,
          dataTestId,
        },
        index,
      ) => {
        const iconButton = (
          <Button
            key={index}
            className={styles.button}
            startIcon={<Icon />}
            data-emphasis={accent === 'tertiary' ? 'subtle' : 'standard'}
            disabled={disabled || !isDefined(onClick)}
            onClick={onClick}
            aria-label={ariaLabel}
            data-testid={dataTestId}
          />
        );

        return isDefined(Wrapper) ? (
          <Wrapper key={index} iconButton={iconButton} />
        ) : (
          iconButton
        );
      },
    )}
  </ButtonGroup>
);
