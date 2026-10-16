import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PartnerAttributionEffect } from './PartnerAttributionEffect';

const DAY_MS = 24 * 60 * 60 * 1000;
const APP_WELCOME_URL = 'https://app.twenty.com/welcome';

const visitPage = (path: string) => {
  window.history.replaceState(null, '', path);

  return render(
    <>
      <PartnerAttributionEffect />
      <a href={APP_WELCOME_URL} onClick={(event) => event.preventDefault()}>
        Start for free
      </a>
    </>,
  );
};

const clickStartForFree = async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const link = screen.getByRole('link', { name: 'Start for free' });

  await user.click(link);

  return link.getAttribute('href');
};

describe('PartnerAttributionEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-10-01T00:00:00Z') });
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds the partner from the landing URL to app links', async () => {
    visitPage('/?partner=Acme');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=acme`);
  });

  it('leaves app links unchanged without a partner', async () => {
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('ignores an invalid partner', async () => {
    visitPage('/?partner=acme.com');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('remembers the partner on later pages for 30 days', async () => {
    visitPage('/?partner=acme').unmount();
    jest.setSystemTime(Date.now() + 29 * DAY_MS);
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=acme`);
  });

  it('forgets the partner after 30 days', async () => {
    visitPage('/?partner=acme').unmount();
    jest.setSystemTime(Date.now() + 31 * DAY_MS);
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('replaces the partner when a new one comes in', async () => {
    visitPage('/?partner=acme').unmount();
    visitPage('/?partner=globex');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=globex`);
  });
});
