'use client';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import { Theme } from '@/app/_components/ui/theme/theme';
import { UserGuideHomeCardsType } from '@/content/user-guide/constants/UserGuideHomeCards';

const StyledContainer = styled.div`
  color: ${Theme.border.color.plain};
  border: 2px solid ${Theme.border.color.plain};
  border-radius: ${Theme.border.radius.md};
  gap: ${Theme.spacing(4)};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 340px;

  &:hover {
    box-shadow: -8px 8px 0px -4px ${Theme.color.gray60};
  }

  @media (max-width: 385px) {
    width: 280px;
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
  padding: 0 16px 24px;
  font-weight: ${Theme.font.weight.regular};
  line-height: 21px;
`;

const StyledImage = styled.img`
  border-bottom: 1.5px solid #14141429;
`;

export default function UserGuideCard({
  card,
}: {
  card: UserGuideHomeCardsType;
}) {
  const router = useRouter();
  return (
    <StyledContainer onClick={() => router.push(`/user-guide/${card.url}`)}>
      <StyledImage src={card.image} alt={card.title} />
      <StyledHeading>{card.title}</StyledHeading>
      <StyledSubHeading>{card.subtitle}</StyledSubHeading>
    </StyledContainer>
  );
}
