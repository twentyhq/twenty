import { styled } from '@linaria/react';

import { color, EASING, radius } from '@/tokens';

import { CASE_STUDY_CARD_ASPECT_RATIO } from './case-study-card-aspect-ratio';
import { CASE_STUDY_MODAL_IMAGE_HEIGHT } from './case-study-modal-image-height';

const VisualFrame = styled.div`
  background-color: ${color('black-5')};
  overflow: hidden;
  position: relative;
  width: 100%;

  &[data-size='card'] {
    aspect-ratio: ${CASE_STUDY_CARD_ASPECT_RATIO};
  }

  &[data-size='modal'] {
    border-radius: ${radius(1.5)};
    height: ${CASE_STUDY_MODAL_IMAGE_HEIGHT};
  }

  &[data-size='card']::after {
    background: linear-gradient(
      180deg,
      transparent 55%,
      ${color('black-10')} 100%
    );
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  & img {
    display: block;
    height: 100%;
    object-fit: cover;
    transform: scale(1);
    transition: transform 0.55s ${EASING.standard};
    width: 100%;
  }
`;

export function CaseStudyVisual({
  alt,
  imageUrl,
  size = 'card',
}: {
  alt?: string;
  imageUrl: string;
  size?: 'card' | 'modal';
}) {
  return (
    <VisualFrame data-size={size}>
      <img alt={alt ?? ''} loading="lazy" src={imageUrl} />
    </VisualFrame>
  );
}
