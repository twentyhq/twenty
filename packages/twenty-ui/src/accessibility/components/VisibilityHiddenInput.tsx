import styled from '@emotion/styled';
import { VISIBILITY_HIDDEN } from '@ui/accessibility/utils/visibility-hidden';
import { forwardRef } from 'react';

const StyledInput = styled.input`
  ${VISIBILITY_HIDDEN}
`;

const _VisibilityHiddenInput = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
  ref: React.Ref<HTMLInputElement>,
) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <StyledInput ref={ref} {...props} />;
};

export const VisibilityHiddenInput = forwardRef(_VisibilityHiddenInput);
