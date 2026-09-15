export const resizeTextareaToContent = (textarea: HTMLTextAreaElement) => {
  textarea.style.blockSize = 'auto';

  const borderBlockSize = textarea.offsetHeight - textarea.clientHeight;

  textarea.style.blockSize = `${textarea.scrollHeight + borderBlockSize}px`;
};
