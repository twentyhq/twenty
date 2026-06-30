import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { type EmailThread } from '../types/email-thread';
import { ThreadRow } from './ThreadRow';

i18n.load('en', {});
i18n.activate('en');

const THREAD: EmailThread = {
  date: 'Jan 1, 2026',
  messageCount: 3,
  participants: [
    { avatarUrl: '', name: 'Ada' },
    { avatarUrl: '', name: 'Linus' },
  ],
  preview: { id: 'A short preview.' },
  subject: { id: 'A subject line' },
};

describe('ThreadRow', () => {
  it('renders the subject, preview, participants, count and date', () => {
    render(
      <I18nProvider i18n={i18n}>
        <ThreadRow thread={THREAD} />
      </I18nProvider>,
    );

    expect(screen.getByText('A subject line')).toBeInTheDocument();
    expect(screen.getByText('A short preview.')).toBeInTheDocument();
    expect(screen.getByText('Ada, Linus')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Jan 1, 2026')).toBeInTheDocument();
  });
});
