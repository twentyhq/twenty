import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
} from 'react';

import { LightIconButton, type LightIconButtonProps } from './LightIconButton';

const StyledLightIconButtonGroupContainer = styled.div`
  display: inline-flex;
  gap: 2px;
`;

export type LightIconButtonGroupProps = Pick<
  LightIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
    Icon: IconComponent;
    accent?: LightIconButtonProps['accent'];
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
  <StyledLightIconButtonGroupContainer className={className}>
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
  </StyledLightIconButtonGroupContainer>
);
