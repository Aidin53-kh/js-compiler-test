import { VariableDeclaration } from "./VariableDeclaration";

import type { Statement, SyntaxKind } from "../std";

export const syntax: Record<SyntaxKind, (node: Statement) => void> = {
    VariableDeclaration,
};

