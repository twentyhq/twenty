import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import { Container } from '@/design-system/components';
import { Menu, type MenuDataType } from '@/sections/Menu';
import { theme } from '@/theme';

const PageSection = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  min-width: 0;
  width: 100%;
`;

const Article = styled.article`
  margin-left: auto;
  margin-right: auto;
  max-width: ${theme.layout.readingNarrow};
  min-width: 0;
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(12)};
  }

  h1 {
    color: ${theme.colors.primary.text[100]};
    font-size: ${theme.font.size(10)};
    font-weight: ${theme.font.weight.light};
    letter-spacing: -0.03em;
    line-height: ${theme.lineHeight(11)};
    margin: 0;

    @media (min-width: ${theme.breakpoints.md}px) {
      font-size: ${theme.font.size(12)};
      line-height: ${theme.lineHeight(13)};
    }
  }

  h2 {
    color: ${theme.colors.primary.text[100]};
    font-size: ${theme.font.size(6)};
    font-weight: ${theme.font.weight.medium};
    line-height: 1.3;
    margin: 0;
    margin-top: ${theme.spacing(12)};
  }

  p {
    color: ${theme.colors.primary.text[80]};
    font-size: ${theme.font.size(4)};
    line-height: 1.65;
    margin: 0;
    margin-top: ${theme.spacing(4)};
  }

  p:first-of-type {
    margin-top: ${theme.spacing(6)};
  }

  ol,
  ul {
    color: ${theme.colors.primary.text[80]};
    font-size: ${theme.font.size(4)};
    line-height: 1.65;
    margin: 0;
    margin-top: ${theme.spacing(4)};
    padding-left: ${theme.spacing(6)};
  }

  li {
    margin-top: ${theme.spacing(2)};
  }

  li:first-child {
    margin-top: 0;
  }

  strong {
    color: ${theme.colors.primary.text[100]};
    font-weight: ${theme.font.weight.medium};
  }

  a {
    color: ${theme.colors.highlight[100]};
    text-decoration: underline;
  }
`;

type LegalDocumentPageProps = {
  children: ReactNode;
  menuData: MenuDataType;
  title: string;
};

export function LegalDocumentPage({
  children,
  menuData,
  title,
}: LegalDocumentPageProps) {
  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={menuData.navItems}
        socialLinks={menuData.socialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={menuData.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuData.socialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <PageSection>
        <Container>
          <Article>
            <h1>{title}</h1>
            {children}
          </Article>
        </Container>
      </PageSection>
    </>
  );
}
