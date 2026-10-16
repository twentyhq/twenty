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
    visitPage('/?via=Acme');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=acme`);
  });

  it('does not take the partner from the brief page ?partner= param', async () => {
    visitPage('/partners/brief?partner=acme');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('leaves app links unchanged without a partner', async () => {
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('ignores an invalid partner', async () => {
    visitPage('/?via=acme.com');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('remembers the partner on later pages for 30 days', async () => {
    visitPage('/?via=acme').unmount();
    jest.setSystemTime(Date.now() + 29 * DAY_MS);
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=acme`);
  });

  it('forgets the partner after 30 days', async () => {
    visitPage('/?via=acme').unmount();
    jest.setSystemTime(Date.now() + 31 * DAY_MS);
    visitPage('/pricing');

    expect(await clickStartForFree()).toBe(APP_WELCOME_URL);
  });

  it('replaces the partner when a new one comes in', async () => {
    visitPage('/?via=acme').unmount();
    visitPage('/?via=globex');

    expect(await clickStartForFree()).toBe(`${APP_WELCOME_URL}?partner=globex`);
  });
});
