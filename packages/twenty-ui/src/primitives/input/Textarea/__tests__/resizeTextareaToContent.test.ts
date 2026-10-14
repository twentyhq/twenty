import { resizeTextareaToContent } from '../internal/resizeTextareaToContent';

const createTextarea = ({
  scrollHeight,
  offsetHeight,
  clientHeight,
}: {
  scrollHeight: number;
  offsetHeight: number;
  clientHeight: number;
}) => {
  const textarea = document.createElement('textarea');

  Object.defineProperties(textarea, {
    scrollHeight: { value: scrollHeight },
    offsetHeight: { value: offsetHeight },
    clientHeight: { value: clientHeight },
  });
  textarea.style.blockSize = '20px';

  return textarea;
};

describe('resizeTextareaToContent', () => {
  it('sizes the textarea to its content plus its block borders', () => {
    const textarea = createTextarea({
      scrollHeight: 48,
      offsetHeight: 50,
      clientHeight: 48,
    });

    resizeTextareaToContent(textarea);

    expect(textarea.style.blockSize).toBe('50px');
  });

  it('keeps the automatic block size while the textarea is not rendered', () => {
    const textarea = createTextarea({
      scrollHeight: 0,
      offsetHeight: 0,
      clientHeight: 0,
    });

    resizeTextareaToContent(textarea);

    expect(textarea.style.blockSize).toBe('auto');
  });
});
