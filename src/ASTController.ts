import { syntax } from "./syntax";
import type { AST } from "./std";

export class ASTController 
{
    public static start(ast: AST): AST 
    {
        for (const node of ast.body) syntax[node.type](node);
        
        return ast;
    }
}
