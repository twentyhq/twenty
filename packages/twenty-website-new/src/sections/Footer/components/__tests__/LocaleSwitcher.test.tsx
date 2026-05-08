import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/i18n/use-locale', () => ({
  useLocale: jest.fn(),
}));

import { usePathname } from 'next/navigation';

import { useLocale } from '@/lib/i18n/use-locale';
import { LocaleSwitcher } from '@/sections/Footer/components/LocaleSwitcher';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LocaleSwitcher', () => {
  it('renders a labelled trigger button showing the active locale in its native name', () => {
    mockUsePathname.mockReturnValue('/pricing');
    mockUseLocale.mockReturnValue('en');

    const html = renderToStaticMarkup(<LocaleSwitcher />);

    expect(html).toMatch(/aria-label="Change language"/i);
    expect(html).toContain('>English<');
  });

  it('shows the native French label when the active locale is French', () => {
    mockUsePathname.mockReturnValue('/fr/pricing');
    mockUseLocale.mockReturnValue('fr-FR');

    const html = renderToStaticMarkup(<LocaleSwitcher />);

    expect(html).toContain('>Français<');
  });

  it('renders the trigger as a real button so it is keyboard-focusable and screen-reader-discoverable', () => {
    mockUsePathname.mockReturnValue('/pricing');
    mockUseLocale.mockReturnValue('en');

    const html = renderToStaticMarkup(<LocaleSwitcher />);
    const triggerTag = html.match(
      /<button[^>]*aria-label="Change language"[^>]*>/i,
    );

    expect(triggerTag).not.toBeNull();
    expect(triggerTag?.[0]).toMatch(/type="button"/);
    expect(triggerTag?.[0]).toMatch(/aria-haspopup="dialog"/);
    expect(triggerTag?.[0]).toMatch(/aria-expanded="false"/);
  });

  it('does not render the popup contents server-side when closed (avoids hydration drift)', () => {
    mockUsePathname.mockReturnValue('/pricing');
    mockUseLocale.mockReturnValue('en');

    const html = renderToStaticMarkup(<LocaleSwitcher />);

    expect(html).not.toContain('href="/pricing"');
    expect(html).not.toContain('href="/fr/pricing"');
  });
});
