import { MouseEvent } from 'react';
import styled from '@emotion/styled';

import { EllipsisDisplay } from 'src/field/display/components/EllipsisDisplay';
import { LinkFieldValue } from 'src/field/types/LinkFieldValue';
import { LinkType, RoundedLink, SocialLink } from 'src/navigation';
import { checkUrlType } from 'src/utils/checkUrlType';

const StyledRawLink = styled(RoundedLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type LinkDisplayProps = {
  value?: LinkFieldValue;
};

export const LinkDisplay = ({ value }: LinkDisplayProps) => {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const absoluteUrl = value?.url
    ? value.url.startsWith('http')
      ? value.url
      : 'https://' + value.url
    : '';

  const displayedValue = value?.label || value?.url || '';

  const type = checkUrlType(absoluteUrl);

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return (
      <EllipsisDisplay>
        <SocialLink href={absoluteUrl} onClick={handleClick} type={type}>
          {displayedValue}
        </SocialLink>
      </EllipsisDisplay>
    );
  }
  return (
    <EllipsisDisplay>
      <StyledRawLink href={absoluteUrl} onClick={handleClick}>
        {displayedValue}
      </StyledRawLink>
    </EllipsisDisplay>
  );
};
