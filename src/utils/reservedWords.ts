const reservedWords = ["mut", "const", "type", "false", "true", "null", "undefined"];

export function ifReservedWords(word: string, cb: (word: string) => void): void {
    isReservedWords(word) ? cb(word) : null;
}

export function isReservedWords(word: string): boolean {
    return reservedWords.includes(word);
}
