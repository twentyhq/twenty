import { styled } from '@linaria/react';

import { ExternalLink } from '@/ui';
import {
  color,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  MODAL_SURFACE,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

const ModalRoot = styled.div`
  display: grid;
  inset: 0;
  padding: ${spacing(4)};
  place-items: center;
  position: fixed;
  z-index: ${Z_INDEX.modal};

  ${mediaUp('sm')} {
    padding: ${spacing(6)};
  }
`;

const ModalScrim = styled.div`
  backdrop-filter: blur(2px);
  background: ${MODAL_SURFACE.backdrop};
  inset: 0;
  position: absolute;
`;

const ModalPanel = styled.div`
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.card};
  display: flex;
  flex-direction: column;
  max-height: min(88dvh, 760px);
  overflow: hidden;
  position: relative;
  transition: opacity 0.18s ${EASING.standard};
  width: min(720px, 100%);

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  padding: ${spacing(5.5)} ${spacing(6)} ${spacing(4)};

  ${mediaUp('sm')} {
    padding: ${spacing(7)} ${spacing(7.5)} ${spacing(4)};
  }
`;

const ModalHeaderIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding-right: ${spacing(7.5)};
`;

const ModalHeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  min-width: 0;
`;

const ModalVisualSlot = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  overflow: hidden;
`;

const CloseButton = styled.button`
  background: transparent;
  border: 0;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  line-height: 1;
  padding: 0;
  position: absolute;
  right: ${spacing(4.5)};
  top: ${spacing(4)};

  &:hover {
    color: ${semanticColor.ink};
  }
`;

const ModalClient = styled.span`
  color: ${semanticColor.inkMuted};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const ModalTitle = styled.h2`
  font-size: ${fontSize(5.5)};
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

const ModalBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: ${spacing(5)} ${spacing(6)};

  ${mediaUp('sm')} {
    padding: ${spacing(5.5)} ${spacing(7.5)};
  }
`;

const ModalDesc = styled.div`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(4)};
  line-height: 1.58;
  overflow-wrap: anywhere;

  & p {
    margin: 0 0 ${spacing(3)};

    &:last-child {
      margin-bottom: 0;
    }
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: 600;
  }

  & h3,
  & h4 {
    color: ${semanticColor.ink};
    font-size: ${fontSize(3.75)};
    font-weight: 600;
    margin: ${spacing(5)} 0 ${spacing(2.5)};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }

  & ul {
    display: grid;
    gap: ${spacing(2)};
    list-style: none;
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

const ModalFoot = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(4)};
  padding: ${spacing(4.5)} ${spacing(6)};

  ${mediaUp('sm')} {
    padding: ${spacing(4.5)} ${spacing(7.5)};
  }
`;

const ModalLink = styled(ExternalLink)`
  color: ${color('blue')};
  display: inline-flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1.75)};
  letter-spacing: 0.04em;
  text-decoration: none;
`;

const ModalNav = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
`;

const NavButton = styled.button`
  background: transparent;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(1.5)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  font-weight: 600;
  padding: ${spacing(2.25)} ${spacing(4)};

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
`;

const NavButtonPrimary = styled(NavButton)`
  background: ${semanticColor.ink};
  border-color: ${semanticColor.ink};
  color: ${color('white')};
`;

export const caseStudyModalStyles = {
  CloseButton,
  ModalBody,
  ModalClient,
  ModalDesc,
  ModalFoot,
  ModalHeader,
  ModalHeaderCopy,
  ModalHeaderIntro,
  ModalLink,
  ModalNav,
  ModalPanel,
  ModalRoot,
  ModalScrim,
  ModalTitle,
  ModalVisualSlot,
  NavButton,
  NavButtonPrimary,
};
