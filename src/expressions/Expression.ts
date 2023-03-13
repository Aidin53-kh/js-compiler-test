import { Literal, Identifier, ObjectExpression, ArrayExpression, FunctionExpression } from ".";
import { BuiltinError, ReferenceError, SyntaxError } from "../utils/errors";
import { IExpression } from "../std";
import { Storage } from "../storage";
import { Type } from "../utils/Type";

export class Expression {
    constructor(readonly init: IExpression) {
        const initType = init.type;

        switch (init.type) {
            case "Literal":
                this.init = new Literal(init.value);
                break;
            case "Identifier":
                this.init = new Identifier(init.name);
                break;
            case "ObjectExpression":
                this.init = new ObjectExpression(init.properties);
                break;
            case "ArrayExpression":
                this.init = new ArrayExpression(init.elements);
                break;
            case "FunctionExpression":
                this.init = new FunctionExpression(
                    init.id,
                    init.params,
                    init.body,
                    init.generator,
                    init.expression,
                    init.async,
                    init.returnType
                );
                break;
            default:
                new BuiltinError(`'${initType}' not implemented in 'Expression' class.`, "code b1");
        }
    }

    public static validate(expr: IExpression): void {
        switch (expr.type) {
            case "Identifier": {
                const variable = Storage.Variables.get(expr.name);
                if (!variable) {
                    throw new ReferenceError(`'${expr.name}' is not defined.`, "code 23");
                }
                if (!variable.init) {
                    throw new SyntaxError(
                        `Variable '${expr.name}' is used before being assigned.`,
                        "code 26"
                    );
                }
                break;
            }
            case "Literal":
                break;
            case "ObjectExpression":
                expr.properties.map((property) => this.validate(property.value));
                break;
            case "ArrayExpression":
                expr.elements.map((element) => this.validate(element));
                break;
            case "FunctionExpression":
                FunctionExpression.validate(expr);
                break;
        }
    }
}
