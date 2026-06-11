import { chromium } from 'playwright';

// OLD-parity battery: computed values measured identically on :3002 and
// :3004 with selectors that resolve on BOTH DOMs. Exact equality except
// the executable ledger below.
const OLD_URL = process.env.MOCKUP_OLD_URL ?? 'http://localhost:3002/';
const NEW_URL = process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/';

// Every deliberate divergence is declared here; an unledgered diff fails,
// a ledgered-but-absent diff also fails.
// (Empty today: the one candidate — product transparent.medium p3 0.078
// vs old rgba 0.08 — sits below colorimetric resolution and passes as
// equal.) Shape: [{ key, reason }].
const LEDGER = [];

const failures = [];
const assert = (condition, message) => {
  console.log(`  ${condition ? '✓' : '✗'} ${message}`);
  if (!condition) {
    failures.push(message);
  }
};

async function measure(browser, url) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 240000 });
  await page.waitForTimeout(4000);
  const values = await page.evaluate(() => {
    // page.evaluate serializes this callback: helpers must live inside it.
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const styleOf = (el) => (el ? getComputedStyle(el) : null);
    // page.evaluate serializes this callback: helpers must live inside it.
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const round = (n) => Math.round(n * 10) / 10;
    // The framed window: both sites render a 20px-radius white shell.
    const frame = [...document.querySelectorAll('div')].find((el) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return cs.borderRadius === '20px' && rect.width > 900;
    });
    const sidebar = frame?.querySelector('aside');
    const companiesLabel = [...(sidebar?.querySelectorAll('span') ?? [])].find(
      (el) => el.textContent === 'Companies',
    );
    const anthropicRow = frame?.querySelector('[data-row-id="anthropic"]');
    const firstCell = anthropicRow?.firstElementChild;
    const chip = [...(anthropicRow?.querySelectorAll('div') ?? [])].find(
      (el) => el.textContent?.trim() === 'Anthropic',
    );
    const workspaceName = [...(sidebar?.querySelectorAll('span') ?? [])].find(
      (el) => el.textContent === 'Apple',
    );
    const newButton = [...(frame?.querySelectorAll('div, span') ?? [])].find(
      (el) =>
        el.textContent?.trim() === 'New' &&
        styleOf(el.parentElement)?.borderRadius === '4px',
    );
    const terminal = document.querySelector('[data-terminal-shell]');
    const terminalRect = terminal?.getBoundingClientRect();
    const terminalStyle = styleOf(terminal);
    const sendButton = terminal?.querySelector(
      'button[aria-label="Send message"]',
    );
    const workspaceChip = [
      ...(terminal?.querySelectorAll('button') ?? []),
    ].find((el) => el.textContent?.includes('my-twenty-app'));
    const promptText = [...(terminal?.querySelectorAll('p') ?? [])].find((el) =>
      el.textContent?.startsWith('Scaffold a launch-ops CRM'),
    );
    const frameStyle = styleOf(frame);
    const frameRect = frame?.getBoundingClientRect();
    return {
      frameWidth: frameRect ? round(frameRect.width) : null,
      frameRadius: frameStyle?.borderRadius ?? null,
      frameBorder: frameStyle?.borderTopWidth ?? null,
      sidebarWidth: sidebar
        ? round(sidebar.getBoundingClientRect().width)
        : null,
      navLabelFont: styleOf(companiesLabel)?.fontSize ?? null,
      navLabelWeight: styleOf(companiesLabel)?.fontWeight ?? null,
      navLabelColor: styleOf(companiesLabel)?.color ?? null,
      rowHeight: firstCell
        ? round(firstCell.getBoundingClientRect().height)
        : null,
      cellBorderBottom: styleOf(firstCell)?.borderBottomColor ?? null,
      chipHeight: chip ? round(chip.getBoundingClientRect().height) : null,
      chipRadius: styleOf(chip)?.borderRadius ?? null,
      chipBackground: styleOf(chip)?.backgroundColor ?? null,
      workspaceNameFont: styleOf(workspaceName)?.fontSize ?? null,
      workspaceNameColor: styleOf(workspaceName)?.color ?? null,
      navActionBorderColor: newButton
        ? styleOf(newButton.parentElement)?.borderTopColor
        : null,
      terminalWidth: terminalRect ? round(terminalRect.width) : null,
      terminalHeight: terminalRect ? round(terminalRect.height) : null,
      terminalRadius: terminalStyle?.borderRadius ?? null,
      terminalBackground: terminalStyle?.backgroundColor ?? null,
      terminalBorderColor: terminalStyle?.borderTopColor ?? null,
      sendBackground: styleOf(sendButton)?.backgroundColor ?? null,
      sendRadius: styleOf(sendButton)?.borderRadius ?? null,
      workspaceChipBackground: styleOf(workspaceChip)?.backgroundColor ?? null,
      workspaceChipColor: styleOf(workspaceChip)?.color ?? null,
      workspaceChipHeight: workspaceChip
        ? round(workspaceChip.getBoundingClientRect().height)
        : null,
      promptFont: styleOf(promptText)?.fontSize ?? null,
      promptColor: styleOf(promptText)?.color ?? null,
      promptLineHeight: styleOf(promptText)?.lineHeight ?? null,
    };
  });
  await page.close();
  return values;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const oldValues = await measure(browser, OLD_URL);
const newValues = await measure(browser, NEW_URL);
await browser.close();

// Colors compare colorimetrically: the old site serializes sRGB, ours
// display-p3 — identical colors, different encodings.
function normalizeColor(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const p3 = value.match(
    /color\(display-p3 ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/,
  );
  if (p3) {
    const [, r, g, b, a] = p3;
    return [r, g, b]
      .map((channel) => Math.round(Number(channel) * 255))
      .concat([a === undefined ? 1 : Math.round(Number(a) * 1000) / 1000])
      .join(',');
  }
  const rgb = value.match(
    /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/,
  );
  if (rgb) {
    const [, r, g, b, a] = rgb;
    return [r, g, b]
      .map((channel) => Math.round(Number(channel)))
      .concat([a === undefined ? 1 : Math.round(Number(a) * 1000) / 1000])
      .join(',');
  }
  return value;
}

function colorsEqual(a, b) {
  const left = normalizeColor(a).split(',').map(Number);
  const right = normalizeColor(b).split(',').map(Number);
  if (left.length !== right.length || left.some(Number.isNaN)) {
    return normalizeColor(a) === normalizeColor(b);
  }
  return left.every(
    (channel, index) =>
      Math.abs(channel - right[index]) <= (index === 3 ? 0.005 : 1),
  );
}

const ledgeredKeys = new Set(LEDGER.map((entry) => entry.key));
for (const key of Object.keys(oldValues)) {
  const oldValue = oldValues[key];
  const newValue = newValues[key];
  const isColorKey = /color|background|border(?!.*Width)/i.test(key);
  const equal = isColorKey
    ? colorsEqual(String(oldValue), String(newValue))
    : String(oldValue) === String(newValue);
  if (ledgeredKeys.has(key)) {
    assert(
      !equal,
      `${key}: ledgered divergence present (old ${oldValue} vs new ${newValue})`,
    );
    continue;
  }
  assert(equal, `${key}: ${oldValue} == ${newValue}`);
}

if (failures.length > 0) {
  console.error(`mockup-old-parity: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('mockup-old-parity: OK');
