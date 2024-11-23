export function cleanText(text) {
    const cleanedText = text.replace(/@@@.*?@@@/g, "");
    console.log('---cleanedText', cleanedText);
    return cleanedText;
}