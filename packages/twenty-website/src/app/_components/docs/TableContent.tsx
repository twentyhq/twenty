'use client';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import ClientOnly from '@/app/_components/docs/ClientOnly';
import mq from '@/app/_components/ui/theme/mq';
import { Theme } from '@/app/_components/ui/theme/theme';
import { useHeadsObserver } from '@/app/user-guide/hooks/useHeadsObserver';

const StyledContainer = styled.div`
  ${mq({
    display: ['none', 'none', 'flex'],
    flexDirection: 'column',
    background: `${Theme.background.secondary}`,
    borderLeft: `1px solid ${Theme.background.transparent.medium}`,
    padding: `0px ${Theme.spacing(6)}`,
  })};
  width: 300px;
  min-width: 300px;
`;

const StyledNav = styled.nav`
  width: 220px;
  min-width: 220px;
  align-self: flex-start;
  padding: 32px 0px;
  position: -webkit-sticky;
  position: sticky;
  top: 70px;
  max-height: calc(100vh - 70px);
  overflow: auto;
`;

const StyledUnorderedList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const StyledList = styled.li`
  margin: 12px 0px;
`;

const StyledLink = styled.a`
  text-decoration: none;
  font-size: 12px;
  font-family: var(--font-inter);
  color: ${Theme.text.color.tertiary};
  &:hover {
    color: ${Theme.text.color.secondary};
  }
  &:active {
    color: ${Theme.text.color.primary};
    font-weight: 500 !important;
  }
`;

const StyledHeadingText = styled.div`
  font-size: ${Theme.font.size.sm};
  color: ${Theme.text.color.quarternary};
  margin-bottom: 20px;
`;

const getStyledHeading = (level: number) => {
  switch (level) {
    case 3:
      return {
        marginLeft: 10,
      };
    case 4:
      return {
        marginLeft: 20,
      };
    case 5:
      return {
        marginLeft: 30,
      };
    default:
      return undefined;
  }
};

interface HeadingType {
  id: string;
  elem: HTMLElement;
  className: string;
  text: string;
  level: number;
}

const DocsTableContents = () => {
  const [headings, setHeadings] = useState<HeadingType[]>([]);
  const pathname = usePathname();
  const { activeText } = useHeadsObserver(pathname);

  useEffect(() => {
    const nodes: HTMLElement[] = Array.from(
      document.querySelectorAll('h2, h3, h4, h5'),
    ).filter((elem) => (elem as HTMLElement).id !== 'edit') as HTMLElement[];

    const elements: HeadingType[] = nodes.map(
      (elem): HeadingType => ({
        id: elem.id,
        elem: elem,
        className: elem.className,
        text: elem.innerText,
        level: Number(elem.nodeName.charAt(1)),
      }),
    );
    setHeadings(elements);
  }, []);

  return (
    <StyledContainer>
      <StyledNav>
        <StyledHeadingText>Table of Content</StyledHeadingText>

        <ClientOnly>
          {!!headings?.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <StyledUnorderedList>
                {headings.map((heading) => (
                  <StyledList
                    key={heading.text}
                    style={getStyledHeading(heading.level)}
                  >
                    <StyledLink
                      href={`#${heading.text}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const yOffset = -70;
                        const y =
                          heading.elem.getBoundingClientRect().top +
                          window.scrollY +
                          yOffset;

                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }}
                      style={{
                        fontWeight:
                          activeText === heading.text ? 'bold' : 'normal',
                      }}
                    >
                      {heading.text}
                    </StyledLink>
                  </StyledList>
                ))}
              </StyledUnorderedList>
            </motion.div>
          )}
        </ClientOnly>
      </StyledNav>
    </StyledContainer>
  );
};

export default DocsTableContents;
