import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import '@ui/theme/theme-light.css';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { AssistantAvatar } from '../AssistantAvatar';
import { ASSISTANT_AVATAR_FACES } from '../internal/constants/assistantAvatarFaces.constant';

afterEach(cleanup);

it('displays every static expression when the browser prefers reduced motion', () => {
  render(
    <>
      {ASSISTANT_AVATAR_FACES.map((face) => (
        <AssistantAvatar
          key={`animated-${face}`}
          face={face}
          isAnimated
          aria-label={`Animated ${face}`}
        />
      ))}
      {ASSISTANT_AVATAR_FACES.map((face) => (
        <AssistantAvatar
          key={`static-${face}`}
          face={face}
          aria-label={`Static ${face}`}
        />
      ))}
    </>,
  );

  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
    true,
  );

  for (const face of ASSISTANT_AVATAR_FACES) {
    const animatedAvatar = screen.getByRole('img', {
      name: `Animated ${face}`,
    });
    const staticAvatar = screen.getByRole('img', { name: `Static ${face}` });
    const fallbackFace = animatedAvatar.querySelector(
      ':scope > span:nth-child(2)',
    );
    const staticFace = staticAvatar.querySelector(':scope > span:nth-child(2)');
    const animatedFace = animatedAvatar.lastElementChild;

    if (
      !isDefined(fallbackFace) ||
      !isDefined(staticFace) ||
      !isDefined(animatedFace)
    ) {
      throw new Error('Assistant face layers are missing');
    }

    expect(animatedAvatar.getAnimations({ subtree: true })).toHaveLength(0);
    expect(fallbackFace).toBeVisible();
    expect(getComputedStyle(fallbackFace).maskImage).toBe(
      getComputedStyle(staticFace).maskImage,
    );
    expect(getComputedStyle(animatedFace).display).toBe('none');
  }
});
