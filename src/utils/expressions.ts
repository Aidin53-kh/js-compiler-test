import { BuiltinError } from "./errors";
import {
    IArrayExpression,
    IExpression,
    IIdentifier,
    ILiteral,
    ILiteralValue,
    IObjectExpression,
    IObjectProperty,
} from "../std";

export class Literal implements ILiteral {
    readonly type = "Literal";
    constructor(readonly value: ILiteralValue) {}
}

export class Identifier implements IIdentifier {
    readonly type = "Identifier";
    constructor(readonly name: string) {}
}

export class ObjectExpression implements IObjectExpression {
    readonly type = "ObjectExpression";
    constructor(readonly properties: IObjectProperty[]) {}
}

export class ArrayExpression implements IArrayExpression {
    readonly type = "ArrayExpression";
    constructor(readonly elements: IExpression[]) {}
}

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
            case "ArrayExpression": {
                this.init = new ArrayExpression(init.elements);
                break;
            }
            default:
                new BuiltinError(`'${initType}' not implemented in 'Expression' class.`, "code b1");
        }
    }
}
