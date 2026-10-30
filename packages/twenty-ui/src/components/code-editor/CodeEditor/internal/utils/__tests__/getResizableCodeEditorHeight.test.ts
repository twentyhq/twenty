import { getResizableCodeEditorHeight } from '../getResizableCodeEditorHeight';

describe('getResizableCodeEditorHeight', () => {
  it.each([
    { height: 20, expectedHeight: 50 },
    { height: 260, expectedHeight: 260 },
    { height: 700, expectedHeight: 500 },
  ])(
    'bounds the supplied numeric height $height to $expectedHeight',
    ({ height, expectedHeight }) => {
      expect(
        getResizableCodeEditorHeight({ height, resizedHeight: undefined }),
      ).toBe(expectedHeight);
    },
  );

  it('preserves the resized height while its source height is unchanged', () => {
    expect(
      getResizableCodeEditorHeight({
        height: 200,
        resizedHeight: { sourceHeight: 200, value: 320 },
      }),
    ).toBe(320);
  });

  it('uses the new numeric height after the source height changes', () => {
    expect(
      getResizableCodeEditorHeight({
        height: 260,
        resizedHeight: { sourceHeight: 200, value: 320 },
      }),
    ).toBe(260);
  });

  it('uses the default height before a CSS height is measured', () => {
    expect(
      getResizableCodeEditorHeight({
        height: '60vh',
        resizedHeight: undefined,
      }),
    ).toBe(450);
  });

  it('uses the measured height for the matching CSS height', () => {
    expect(
      getResizableCodeEditorHeight({
        height: '60vh',
        resizedHeight: { sourceHeight: '60vh', value: 320 },
      }),
    ).toBe(320);
  });

  it('discards the previous measurement after the CSS height changes', () => {
    expect(
      getResizableCodeEditorHeight({
        height: '80vh',
        resizedHeight: { sourceHeight: '60vh', value: 320 },
      }),
    ).toBe(450);
  });
});
