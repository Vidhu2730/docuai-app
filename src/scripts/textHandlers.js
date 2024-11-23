export function cleanText(text) {
    const cleanedText = text.replace(/@@@.*?@@@/g, "");
    return cleanedText;
}