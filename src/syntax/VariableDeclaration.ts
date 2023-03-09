import { DatatypeList, T } from "../utils/datatypes";
import { Expression, Identifier } from "../utils/expressions";
import { ReferenceError, SyntaxError } from "../utils/errors";
import { Storage } from "../storage";
import { Statement } from "../std";
import { inferDatatype } from "../utils/inferDatatype";

export const VariableDeclaration = (node: Statement): void => {
    const { datatypes, declarations, kind } = node;

    // runs for each variable declarator
    for (let { id, init, type } of declarations) {
        // throws an error when initializer is not set for constants
        if (kind === "const" && !init) {
            throw new SyntaxError(`constant '${id.name}' most have an initializer.`, "code 1");
        }

        // throws an error when variable is already defined
        Storage.AtAll.ifExist(id.name, () => {
            throw new ReferenceError(`Duplicate variable '${id.name}'`, "code 2");
        });

        // if the variable value is an 'Identifier' replace it with its value
        if (init?.type === "Identifier") {
            const initRef = Storage.Variables.get(init.name);

            if (!initRef) {
                throw new ReferenceError(`'${init.name}' is not defined.`, "code 5");
            }

            if (!initRef.init) {
                throw new SyntaxError(`Variable '${initRef.id.name}' is used before being assigned.`, "code 6")
            }

            init = initRef.init;
        }

        Storage.Variables.set(id.name, {
            id: new Identifier(id.name),
            init: init ? new Expression(init).init : null,
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
