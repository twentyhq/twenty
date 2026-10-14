export const resizeTextareaToContent = (textarea: HTMLTextAreaElement) => {
  textarea.style.blockSize = 'auto';

  const scrollHeight = textarea.scrollHeight;

  if (scrollHeight === 0) {
    return;
  }

  const borderBlockSize = textarea.offsetHeight - textarea.clientHeight;

  textarea.style.blockSize = `${scrollHeight + borderBlockSize}px`;
};
