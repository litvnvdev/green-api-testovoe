/**
 * Подгоняет высоту textarea под содержимое, но не выше maxHeight.
 * Полоса прокрутки появляется, только когда текст не помещается.
 */
export function fitTextareaHeight(textarea: HTMLTextAreaElement, maxHeight: number): void {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
}
