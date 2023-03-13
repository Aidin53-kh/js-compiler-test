import { VariableDeclaration } from "./VariableDeclaration";

import type { IReturnStatement, Statement, SyntaxKind } from "../std";
import { Expression } from "../expressions";

export const syntax: Record<SyntaxKind, (node: any) => void> = {
    VariableDeclaration,
    ReturnStatement: (node: IReturnStatement) => {
        Expression.validate(node.argument);
    },
};
