import { styled } from '@linaria/react';
import { BORDER_COMMON } from '@ui/theme';

const StyledBaseContainer = styled.div<{
  fontColorExtraLight: string;
  fontColorMedium: string;
  backgroundColorTransparentSecondary: string;
  backgroundColorSecondary: string;
  fontColorSecondary: string;
  isReadOnly: boolean;
  borderColorBlue: string;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  &.focus-active {
    border-radius: ${BORDER_COMMON.radius.sm};
    outline: 1px solid ${({ borderColorBlue }) => borderColorBlue};
  }

  &:hover {
    ${(props) => {
      if (!props.isReadOnly) return '';

      return `
        outline: 1px solid ${props.fontColorMedium};
        border-radius: 0px;
        background-color: ${props.backgroundColorSecondary};
        color: ${props.fontColorSecondary};
        
        svg {
          color: ${props.fontColorSecondary};
        }
        
        img {
          opacity: 0.64;
        }
      `;
    }}
  }
`;

export const RecordTableCellBaseContainerWrapper = StyledBaseContainer;
