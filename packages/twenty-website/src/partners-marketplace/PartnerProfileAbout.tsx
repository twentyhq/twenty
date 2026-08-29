import { styled } from '@linaria/react';

import { color, fontFamily, fontSize, semanticColor, spacing } from '@/tokens';

import { RichText } from './RichText';

const About = styled.div`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.25)};
  line-height: 1.58;
  max-width: 64ch;
  overflow-wrap: anywhere;

  & p {
    margin: 0 0 ${spacing(3.5)};

    &:last-child {
      margin-bottom: 0;
    }
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: 600;
  }

  & h3 {
    color: ${semanticColor.ink};
    font-size: ${fontSize(5.5)};
    font-weight: 600;
    margin: ${spacing(6)} 0 ${spacing(2.5)};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }

  & h4 {
    color: ${semanticColor.ink};
    font-size: ${fontSize(4.75)};
    font-weight: 600;
    margin: ${spacing(6)} 0 ${spacing(2.5)};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }

  & ul {
    display: grid;
    gap: ${spacing(2)};
    list-style: none;
    margin: 0 0 ${spacing(3.5)};
    padding: 0;
  }

  & ul li {
    padding-left: ${spacing(5)};
    position: relative;
  }

  & ul li::before {
    background: ${color('blue')};
    border-radius: 50%;
    content: '';
    height: 5px;
    left: 3px;
    position: absolute;
    top: 9px;
    width: 5px;
  }

  & a {
    color: ${color('blue')};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

export function PartnerProfileAbout({ description }: { description: string }) {
  if (!description) return null;

  return (
    <About>
      <RichText markdown={description} />
    </About>
  );
}
