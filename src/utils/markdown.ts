/** Close dangling markdown delimiters so cut-off model output still renders cleanly. */
export function balanceMarkdownDelimiters(content: string): string {
  let text = content;
  if ((text.match(/\*\*/g) || []).length % 2 === 1) {
    text += "**";
  }
  if ((text.match(/`/g) || []).length % 2 === 1) {
    text += "`";
  }
  return text;
}
