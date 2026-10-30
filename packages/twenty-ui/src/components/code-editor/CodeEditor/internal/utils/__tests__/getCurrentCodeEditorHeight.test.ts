import { getCurrentCodeEditorHeight } from '../getCurrentCodeEditorHeight';

describe('getCurrentCodeEditorHeight', () => {
  it('uses the resizable height before the content height', () => {
    expect(
      getCurrentCodeEditorHeight({
        height: 200,
        resizableHeight: 320,
        contentHeight: 120,
        shouldUseResizableHeight: true,
        shouldAutoHeight: true,
      }),
    ).toBe(320);
  });

  it('uses a measured zero content height when auto height is enabled', () => {
    expect(
      getCurrentCodeEditorHeight({
        height: 200,
        resizableHeight: 320,
        contentHeight: 0,
        shouldUseResizableHeight: false,
        shouldAutoHeight: true,
      }),
    ).toBe(0);
  });

  it('keeps the supplied height until content is measured', () => {
    expect(
      getCurrentCodeEditorHeight({
        height: '60vh',
        resizableHeight: 320,
        contentHeight: undefined,
        shouldUseResizableHeight: false,
        shouldAutoHeight: true,
      }),
    ).toBe('60vh');
  });

  it('ignores previous measurements when resizing and auto height are disabled', () => {
    expect(
      getCurrentCodeEditorHeight({
        height: 240,
        resizableHeight: 320,
        contentHeight: 120,
        shouldUseResizableHeight: false,
        shouldAutoHeight: false,
      }),
    ).toBe(240);
  });
});
