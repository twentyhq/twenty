import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  GRADIENT,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { type PartnerService } from './marketplace-partner';
import { ProfileSectionTitle } from './ProfileSectionTitle';

const Section = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  gap: ${spacing(3.5)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ServiceCard = styled.article`
  animation: serviceCardEnter 0.45s ${EASING.standard} both;
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition:
    border-color 0.2s ${EASING.standard},
    box-shadow 0.2s ${EASING.standard},
    transform 0.2s ${EASING.standard};

  &:nth-child(1) {
    animation-delay: 0ms;
  }

  &:nth-child(2) {
    animation-delay: 40ms;
  }

  &:nth-child(3) {
    animation-delay: 80ms;
  }

  &:nth-child(4) {
    animation-delay: 120ms;
  }

  @keyframes serviceCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 8px, 0);
    }

    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  &::before {
    background: ${color('blue')};
    content: '';
    display: block;
    flex-shrink: 0;
    height: 2px;
    opacity: 0.45;
    transition: opacity 0.2s ${EASING.standard};
  }

  &:hover {
    border-color: ${color('blue')}33;
    box-shadow: 0 10px 28px ${color('black-10')};
    transform: translateY(-2px);
  }

  &:hover::before {
    opacity: 1;
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;

    &::before {
      opacity: 1;
    }

    &:hover {
      box-shadow: none;
      transform: none;
    }
  }
`;

const ServiceCap = styled.div`
  background: ${GRADIENT.heroGlow};
  border-bottom: 1px solid ${semanticColor.line};
  flex-shrink: 0;
  height: ${spacing(3.5)};
  transition: background 0.2s ${EASING.standard};

  ${ServiceCard}:hover & {
    background:
      linear-gradient(90deg, ${color('blue')}0d, transparent 72%),
      ${GRADIENT.heroGlow};
  }
`;

const ServiceBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(2)};
  padding: ${spacing(4.5)} ${spacing(5)} ${spacing(5)};
`;

const ServiceTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.25;
`;

const ServiceDescription = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 1.52;
`;

export function PartnerServices({
  services,
}: {
  services: readonly PartnerService[];
}) {
  if (services.length === 0) {
    return null;
  }

  const i18n = getServerI18n();

  return (
    <Section aria-labelledby="partner-services-heading">
      <ProfileSectionTitle id="partner-services-heading">
        {i18n._(msg`Services`)}
      </ProfileSectionTitle>
      <ServicesGrid>
        {services.map((service) => (
          <ServiceCard key={service.title}>
            <ServiceCap aria-hidden="true" />
            <ServiceBody>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceDescription>{service.description}</ServiceDescription>
            </ServiceBody>
          </ServiceCard>
        ))}
      </ServicesGrid>
    </Section>
  );
}
