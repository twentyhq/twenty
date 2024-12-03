'use client';
import styled from '@emotion/styled';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { ArticleContent } from '@/app/_components/ui/layout/articles/ArticleContent';
import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { FileContent } from '@/app/_server-utils/get-posts';
import { getUriAndLabel } from '@/shared-utils/pathUtils';

const StyledContainer = styled('div')`
  ${mq({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    fontFamily: `${Theme.font.family}`,
  })};
  width: 100%;
  min-height: calc(100vh - 50px);

  @media (min-width: 990px) {
    justify-content: flex-start;
  }
`;

const StyledWrapper = styled.div`
  @media (max-width: 450px) {
    width: 100%;
    padding: ${Theme.spacing(10)} 32px ${Theme.spacing(20)};
  }

  @media (min-width: 451px) and (max-width: 800px) {
    padding: ${Theme.spacing(10)} 50px ${Theme.spacing(20)};
    width: 440px;
  }

  @media (min-width: 801px) and (max-width: 1500px) {
    max-width: 720px;
    min-width: calc(100% - 184px);
    margin: ${Theme.spacing(10)} 92px ${Theme.spacing(20)};
  }

  @media (min-width: 1500px) {
    max-width: 720px;
    margin: ${Theme.spacing(10)} auto ${Theme.spacing(20)};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(8)};
  @media (min-width: 450px) and (max-width: 800px) {
    width: 340px;
  }
`;

const StyledHeading = styled.h1`
  font-size: 40px;
  font-weight: 700;
  font-family: var(--font-gabarito);
  margin: 0px;
  @media (max-width: 800px) {
    font-size: 28px;
  }
`;

const StyledHeaderInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(1)};
`;

const StyledHeaderInfoSectionTitle = styled.div`
  font-size: ${Theme.font.size.sm};
  padding: ${Theme.spacing(2)} 0px;
  color: ${Theme.text.color.secondary};
  font-weight: ${Theme.font.weight.medium};
  font-family: var(--font-gabarito);
`;

const StyledHeaderInfoSectionSub = styled.p`
  display: flex;
  flex-direction: column;
  gap: ${Theme.spacing(4)};
  color: ${Theme.text.color.tertiary};
  line-height: 1.8;
  margin: 0px;
`;

const StyledRectangle = styled.div`
  width: 100%;
  height: 1px;
  background: ${Theme.background.transparent.medium};
`;

const StyledImageContainer = styled.div<{ loaded: string }>`
  position: relative;
  width: 100%;
  padding-top: 46%;
  overflow: hidden;
  border-radius: 16px;
  border: 2px solid rgba(20, 20, 20, 0.08);
  background: #fafafa;
  transition: border-color 150ms ease-in-out;
  ${({ loaded }) =>
    loaded === 'true' &&
    `border-color: ${Theme.text.color.primary};
  `}
`;

const StyledImage = styled(Image)<{ loaded: string }>`
  opacity: ${({ loaded }) => (loaded === 'true' ? 1 : 0)};
  transition: opacity 250ms ease-in-out;
`;

export default function DocsContent({ item }: { item: FileContent }) {
  const pathname = usePathname();
  const { uri, label } = getUriAndLabel(pathname);
  const [imageLoaded, setImageLoaded] = useState(false);

  const BREADCRUMB_ITEMS = [
    {
      uri: uri,
      label: label,
    },
  ];

  return (
    <StyledContainer>
      <StyledWrapper>
        <StyledHeader>
          <Breadcrumbs
            items={BREADCRUMB_ITEMS}
            activePage={item.itemInfo.title}
            separator="/"
          />
          <StyledHeading>{item.itemInfo.title}</StyledHeading>
          <StyledImageContainer loaded={imageLoaded.toString()}>
            {item.itemInfo.image && (
              <StyledImage
                id={`img-${item.itemInfo.title}`}
                src={item.itemInfo.image}
                alt={item.itemInfo.title}
                fill
                style={{ objectFit: 'cover' }}
                onLoad={() => setImageLoaded(true)}
                loaded={imageLoaded.toString()}
                unoptimized
              />
            )}
          </StyledImageContainer>
          <StyledHeaderInfoSection>
            <StyledHeaderInfoSectionTitle>
              In this article
            </StyledHeaderInfoSectionTitle>
            <StyledHeaderInfoSectionSub>
              {item.itemInfo.info}
            </StyledHeaderInfoSectionSub>
          </StyledHeaderInfoSection>
          <StyledRectangle />
        </StyledHeader>
        <ArticleContent>{item.content}</ArticleContent>
      </StyledWrapper>
    </StyledContainer>
  );
}
