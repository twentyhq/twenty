'use client';
import styled from '@emotion/styled';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Theme } from '@/app/_components/ui/theme/theme';
import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';
import { getCardPath } from '@/shared-utils/getCardPath';

const StyledContainer = styled(Link)`
  text-decoration: none;
  color: ${Theme.border.color.plain};
  border: 2px solid ${Theme.border.color.plain};
  border-radius: ${Theme.border.radius.md};
  gap: ${Theme.spacing(4)};
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    box-shadow: -8px 8px 0px -4px ${Theme.color.gray60};
  }
`;

const StyledHeading = styled.div`
  font-size: ${Theme.font.size.lg};
  color: ${Theme.text.color.primary};
  padding: 0 16px;
  font-weight: ${Theme.font.weight.medium};
  @media (max-width: 800px) {
    font-size: ${Theme.font.size.base};
  }
`;

const StyledSubHeading = styled.div`
  font-size: ${Theme.font.size.xs};
  color: ${Theme.text.color.secondary};
  font-family: ${Theme.font.family};
  margin: 0 16px 24px;
  font-weight: ${Theme.font.weight.regular};
  line-height: 21px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const StyledImage = styled.img`
  border-bottom: 1.5px solid #14141429;
  height: 160px;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
`;

export default function DocsCard({
  card,
  isSection = false,
}: {
  card: DocsArticlesProps;
  isSection?: boolean;
}) {
  const pathname = usePathname();
  const path = getCardPath(card, pathname, isSection);

  if (card.title) {
    return (
      <StyledContainer href={path}>
        <StyledImage src={card.image} alt={card.title} />
        <StyledHeading>{card.title}</StyledHeading>
        <StyledSubHeading>{card.info}</StyledSubHeading>
      </StyledContainer>
    );
  }
}
