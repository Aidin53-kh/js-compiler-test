import { BuiltinError, ReferenceError, SyntaxError } from "./errors";
import {
    IArrayExpression,
    IDatatype,
    IExpression,
    IFunctionExpression,
    IFunctionParameter,
    IIdentifier,
    ILiteral,
    ILiteralValue,
    IObjectExpression,
    IObjectProperty,
    IVariableDeclaration,
} from "../std";
import { Storage } from "../storage";
import { Type } from "./Type";

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

export class FunctionExpression implements IFunctionExpression {
    readonly type = "FunctionExpression";
    constructor(
        readonly id: Identifier | null,
        readonly params: IFunctionParameter[],
        readonly body: IVariableDeclaration[],
        readonly generator: boolean,
        readonly expression: boolean,
        readonly async: boolean,
        readonly returnType: IDatatype[]
    ) {}

    public static inferReturnTypes(fnExpr: IFunctionExpression) {}

    public static inferReturnStatements(fnExpr: IFunctionExpression) {}
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

    public static isValid(expr: IExpression) {
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
                expr.properties.map((property) => this.isValid(property.value));
                break;
            case "ArrayExpression":
                expr.elements.map((element) => this.isValid(element));
                break;
            case "FunctionExpression":
                expr.params.map((param) => {
                    param.datatypes.map((datatype) => Type.isValid(datatype));
                    if (param.type === "AssignmentPattern") {
                        this.isValid(param.right);
                    }
                });
                break;
        }
    }
}
