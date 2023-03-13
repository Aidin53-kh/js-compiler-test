import type { AST } from "../std";
import { Storage } from "../storage";
import { Type } from "../utils/Type";
import { DatatypeList } from "../utils/datatypes";
import { ReferenceError, SyntaxError } from "../utils/errors";
import { Identifier } from "../expressions/Identifier";
import { ifReservedWords } from "../utils/reservedWords";

export class TypeDeclarationExtractor {
    public static extract(ast: AST): AST {
        const body = ast.body.filter((node) => {
            if (node.type === "TypeDeclaration") {
                const { id, datatypes, type } = node;

                // check type name is reserved word
                ifReservedWords(id.name, () => {
                    throw new SyntaxError(
                        `name '${id.name}' is reserved, use another name.`,
                        "code 12"
                    );
                });

                Storage.AtAll.ifExist(id.name, () => {
                    throw new ReferenceError(`Duplicate type '${id.name}'.`, "code 50");
                });

                datatypes.map((t) => Type.validate(t));

                Storage.Types.set(id.name, {
                    type,
                    datatypes: new DatatypeList(datatypes).datatypes,
                    id: new Identifier(id.name),
                });

                return false;
            }

            return true;
        });

        return {
            type: ast.type,
            body,
        };
    }
}
