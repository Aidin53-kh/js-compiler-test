import { Code } from "../std";

export class SyntaxError {
    constructor(message: string, code: Code) {
        console.log(`\nSyntaxError: ${message} (${code})\n`);
        process.exit(1);
    }
}

export class TypeError {
    constructor(message: string, code: Code) {
        console.log(`\nTypeError: ${message} (${code})\n`);
        process.exit(1);
    }
}

export class ReferenceError {
    constructor(message: string, code: Code) {
        console.log(`\nReferenceError: ${message} (${code})\n`);
        process.exit(1);
    }
}

export class BuiltinError {
    constructor(message: string, code: Code) {
        console.log(`\BuiltinError: ${message} (${code})\n`);
        process.exit(1);
    }
}


