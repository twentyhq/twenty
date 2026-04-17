import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from '@ui/theme-constants';
import { linkifyText } from '@ui/utilities/utils/linkifyText';

const StyledLink = styled.a`
  color: ${themeCssVariables.color.blue};
  text-decoration: underline;

  &:hover {
    text-decoration-color: ${themeCssVariables.color.blue};
  }
`;

type LinkifiedTextProps = {
  children: ReactNode;
};

export const LinkifiedText = ({ children }: LinkifiedTextProps) => {
  if (!isNonEmptyString(children)) {
    return <>{children}</>;
  }

  return (
    <>
      {linkifyText(children).map((part, index) =>
        part.type === 'link' ? (
          <StyledLink
            key={index}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {part.content}
          </StyledLink>
        ) : (
          part.content
        ),
      )}
    </>
  );
};
