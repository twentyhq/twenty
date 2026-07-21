import { styled } from '@linaria/react';

import {
  color,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { SectionShell } from '@/ui';

const AVATAR_SIZE_PX = 48;
const SKELETON_CARD_COUNT = 6;

const SkeletonBlock = styled.div`
  animation: marketplaceSkeletonPulse 1.4s ease-in-out infinite;
  background-color: ${semanticColor.line};
  border-radius: ${radius(1)};

  @keyframes marketplaceSkeletonPulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.55;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const CardGrid = styled.div`
  display: grid;
  gap: ${spacing(6)};
  grid-template-columns: 1fr;

  ${mediaUp('md')} {
    gap: ${spacing(8)};
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const CardShell = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(3.5)};
  padding: ${spacing(5.5)} ${spacing(5.5)} ${spacing(4.5)};
`;

const CardTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(3.25)};
`;

const HeaderText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(0.75)};
  min-width: 0;
`;

const AvatarBlock = styled(SkeletonBlock)`
  border-radius: ${radius(1.5)};
  flex-shrink: 0;
  height: ${AVATAR_SIZE_PX}px;
  width: ${AVATAR_SIZE_PX}px;
`;

const NameBar = styled(SkeletonBlock)`
  height: ${spacing(4.5)};
  width: 62%;
`;

const LocationBar = styled(SkeletonBlock)`
  height: ${spacing(3)};
  width: 42%;
`;

const IntroBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1.25)};
`;

const IntroLine = styled(SkeletonBlock)<{ $width?: string }>`
  height: ${spacing(3.5)};
  width: ${({ $width = '100%' }) => $width};
`;

const CardFoot = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(3.5)};
  justify-content: space-between;
  margin-top: ${spacing(0.5)};
  padding-top: ${spacing(3.5)};
`;

const ScopeBar = styled(SkeletonBlock)`
  flex: 1;
  height: ${spacing(3.25)};
  max-width: 68%;
`;

const CtaBar = styled(SkeletonBlock)`
  height: ${spacing(3.25)};
  width: ${spacing(16)};
`;

function PartnerCardSkeleton() {
  return (
    <CardShell aria-hidden="true">
      <CardTop>
        <AvatarBlock />
        <HeaderText>
          <NameBar />
          <LocationBar />
        </HeaderText>
      </CardTop>
      <IntroBlock>
        <IntroLine />
        <IntroLine />
        <IntroLine $width="78%" />
      </IntroBlock>
      <CardFoot>
        <ScopeBar />
        <CtaBar />
      </CardFoot>
    </CardShell>
  );
}

export function MarketplaceListSkeleton() {
  return (
    <SectionShell rhythm="section" scheme="light">
      <CardGrid>
        {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
          <PartnerCardSkeleton key={index} />
        ))}
      </CardGrid>
    </SectionShell>
  );
}
