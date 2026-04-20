import { styled } from '@linaria/react';

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
  text: string;
};

export const LinkifiedText = ({ text }: LinkifiedTextProps) => {
  if (!isNonEmptyString(text)) {
    return null;
  }

  return (
    <>
      {linkifyText(text).map((part, index) =>
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
