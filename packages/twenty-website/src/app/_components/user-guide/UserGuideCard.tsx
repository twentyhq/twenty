'use client';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

import { Theme } from '@/app/_components/ui/theme/theme';
import { UserGuideHomeCardsType } from '@/content/user-guide/constants/UserGuideHomeCards';

const StyledContainer = styled.div`
  color: ${Theme.border.color.plain};
  border: 2px solid ${Theme.border.color.plain};
  border-radius: ${Theme.border.radius.md};
  padding: ${Theme.spacing(6)};
  gap: ${Theme.spacing(4)};
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 348px;
`;

const StyledHeading = styled.div`
  font-size: ${Theme.font.size.lg};
  color: ${Theme.text.color.primary};
`;

const StyledSubHeading = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.secondary};
  font-family: ${Theme.font.family};
`;

const StyledImage = styled.img`
  width: 300px;
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
