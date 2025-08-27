import { styled } from '@linaria/react';
import { VISIBILITY_HIDDEN } from '@ui/accessibility/utils/visibility-hidden';

const StyledSpan = styled.span`
  ${VISIBILITY_HIDDEN}
`;

export const VisibilityHidden = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledSpan>{children}</StyledSpan>;
};
