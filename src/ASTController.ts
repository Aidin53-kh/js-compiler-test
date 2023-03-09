import { syntax } from "./syntax";
import type { AST, Statement } from "./std";

export class ASTController 
{
    public static start(ast: AST): AST 
    {
        for (const node of ast.body) {
            if (node.type !== "TypeDeclaration") {
                syntax[node.type](node as Statement);
            }
        };
        
        return ast;
    }
}
