import { DatatypeList, T } from "../utils/datatypes";
import { Expression, Identifier } from "../utils/expressions";
import { ReferenceError, SyntaxError } from "../utils/errors";
import { Storage } from "../storage";
import { IExpression, IIdentifier, Statement } from "../std";
import { inferDatatype } from "../utils/inferDatatype";
import { TypeChecker } from "../utils/TypeChecker";
import { Type } from "../utils/Type";

export const VariableDeclaration = (node: Statement): void => {
    const { datatypes, declarations, kind } = node;

    // runs for each variable declarator
    for (let { id, init, type } of declarations) {
        // throws an error when initializer is not set for constants
        if (kind === "const" && !init) {
            throw new SyntaxError(`constant '${id.name}' most have an initializer.`, "code 1");
        }  
        
        if (datatypes.length >= 1) {
            datatypes.map((t) => Type.isValid(t));
        }
        
        // throws an error when variable is already defined
        Storage.AtAll.ifExist(id.name, () => {
            throw new ReferenceError(`Duplicate variable '${id.name}'`, "code 2");
        });

        if (init) {
            Expression.isValid(init);

            if (init.type === "Identifier") {
                init = Storage.Variables.get(init.name)?.init as IExpression;
            }
        }

        // here expression is never "Identifier"

        function checkDatatype(expr: IExpression): IExpression {
            TypeChecker.check(expr, datatypes);
            return expr;
        }

        Storage.Variables.set(id.name, {
            id: new Identifier(id.name),
            init: !init
                ? null
                : datatypes.length >= 1
                ? checkDatatype(new Expression(init).init)
                : new Expression(init).init,
            datatypes:
                datatypes.length >= 1
                    ? new DatatypeList(datatypes).datatypes
                    : init
                    ? Array.of(inferDatatype(init))
                    : [new Identifier(T.Dynamic)],
            type,
        });
    }
};
