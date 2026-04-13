'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBrandDiscord,
  IconBrandLinkedin,
  IconBrandThreads,
  IconBrandX,
} from '@tabler/icons-react';

const Sidebar = styled.aside`
  display: none;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  position: fixed;
  right: ${theme.spacing(10)};
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  @media (min-width: ${theme.breakpoints.lg}px) {
    display: flex;
  }
`;

const TocPanel = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(1)};
  display: flex;
  gap: ${theme.spacing(4)};
  max-width: 213px;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};
`;

const ProgressBar = styled.div`
  background-color: ${theme.colors.primary.border[20]};
  border-radius: 1px;
  flex-shrink: 0;
  width: 2px;
`;

const TocItems = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(5.5)};
`;

const TocItem = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(3.5)};
`;

const SocialRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(6)};
`;

const SocialLink = styled.a`
  color: ${theme.colors.primary.text[60]};
  display: flex;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }
`;

type TableOfContentsProps = {
  items: string[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  return (
    <Sidebar>
      <TocPanel>
        <ProgressBar />
        <TocItems aria-label="Table of contents">
          {items.map((item, index) => (
            <TocItem key={index}>
              {index + 1} — {item}
            </TocItem>
          ))}
        </TocItems>
      </TocPanel>

      <SocialRow>
        <SocialLink
          aria-label="Discord"
          href="https://discord.gg/twenty"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandDiscord size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="X"
          href="https://x.com/twentycrm"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandX size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="LinkedIn"
          href="https://www.linkedin.com/company/twenty"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandLinkedin size={20} stroke={1.5} />
        </SocialLink>
        <SocialLink
          aria-label="Threads"
          href="https://www.threads.net/@twentycrm"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandThreads size={20} stroke={1.5} />
        </SocialLink>
      </SocialRow>
    </Sidebar>
  );
}
