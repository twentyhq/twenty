import type { CaseStudyCatalogEntry } from '@/app/case-studies/_constants/types';
import { CLIENT_ICONS } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Link from 'next/link';

const CardLink = styled(Link)`
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary.border[40]};
  }
`;

const Thumbnail = styled.div`
  align-items: center;
  background-color: ${theme.colors.secondary.background[5]};
  display: flex;
  height: 200px;
  justify-content: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: 240px;
  }
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(6)};
  padding-right: ${theme.spacing(6)};
  padding-top: ${theme.spacing(5)};
`;

const Tag = styled.span`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.05em;
  line-height: ${theme.lineHeight(4)};
  text-transform: uppercase;
`;

const Title = styled.h3`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.lineHeight(6.5)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(5.5)};
    line-height: ${theme.lineHeight(7)};
  }
`;

const Summary = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${theme.colors.primary.text[60]};
  display: -webkit-box;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5.5)};
  margin: 0;
  overflow: hidden;
`;

const Footer = styled.div`
  align-items: center;
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  gap: ${theme.spacing(3)};
  margin-left: ${theme.spacing(6)};
  margin-right: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(5)};
  padding-top: ${theme.spacing(5)};
`;

const AuthorAvatar = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50%;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  height: 28px;
  justify-content: center;
  width: 28px;
`;

const AuthorName = styled.span`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
`;

const Dot = styled.span`
  background-color: ${theme.colors.primary.text[40]};
  border-radius: 50%;
  flex-shrink: 0;
  height: 3px;
  width: 3px;
`;

const DateLabel = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
`;

type CardProps = {
  entry: CaseStudyCatalogEntry;
};

export function Card({ entry }: CardProps) {
  const ClientIcon = CLIENT_ICONS[entry.hero.clientIcon];
  const logoWidth = 140;
  const initials = entry.hero.author
    .split(' ')
    .map((word) => word[0])
    .join('');

  return (
    <CardLink href={entry.href}>
      <Thumbnail>
        {ClientIcon ? (
          <ClientIcon
            fillColor={theme.colors.primary.text[100]}
            size={logoWidth}
          />
        ) : null}
      </Thumbnail>

      <CardBody>
        <Tag>Case Study</Tag>
        <Title>
          {entry.hero.title.map((segment) => segment.text).join('')}
        </Title>
        <Summary>{entry.catalogCard.summary}</Summary>
      </CardBody>

      <Footer>
        <AuthorAvatar>{initials}</AuthorAvatar>
        <AuthorName>{entry.hero.author}</AuthorName>
        <Dot />
        <DateLabel>{entry.catalogCard.date}</DateLabel>
      </Footer>
    </CardLink>
  );
}
