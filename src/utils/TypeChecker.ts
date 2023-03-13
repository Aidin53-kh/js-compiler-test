import { FunctionExpression, Identifier } from "../expressions";
import {
    Code,
    IArrayExpression,
    IArrayType,
    IDatatype,
    IExpression,
    IFunctionExpression,
    IFunctionType,
    IIdentifier,
    ILiteral,
    IObjectExpression,
    IObjectType,
    ITupleType,
} from "../std";
import { Storage } from "../storage";
import { Convert } from "./Convert";
import { BuiltinTypes, Type } from "./Type";
import { T } from "./datatypes";

import { BuiltinError, SyntaxError, TypeError } from "./errors";
import { inferDatatype } from "./inferDatatype";
import { _typeof } from "./typeof";

export type Factory = Record<
    Pick<IExpression, "type">["type"],
    Record<Pick<IDatatype, "type">["type"], { check: (expr: any, datatype: any) => boolean }>
>;

export interface Options {
    allowTypeOverriding: boolean;
}

export class TypeChecker {
    private static globalExpr: IExpression;
    private static globalDatatypes: IDatatype[];

    private static error: string;
    private static errorDetails: string[] = [];
    private static code: Code;

    private static opetions: Options = {
        allowTypeOverriding: false,
    };

    public static check(
        expr: IExpression,
        datatypes: IDatatype[],
        options?: Partial<Options>
    ): void {
        this.globalExpr = expr;
        this.globalDatatypes = datatypes;
        this.opetions = { ...this.opetions, ...options };

        if (
            !datatypes.some((datatype) =>
                this.factory[expr.type][datatype.type].check(expr, datatype)
            )
        ) {
            throw new TypeError(
                `${this.error}${
                    this.errorDetails.length
                        ? `\n\t${[...new Set(this.errorDetails)].join("\n\t")}`
                        : ""
                }`,
                this.code
            );
        }
    }

    private static notAssignableError(code: Code): void {
        this.error = this.generateNotAssignableText(this.globalExpr, this.globalDatatypes);
        this.code = code;
    }

    private static generateNotAssignableText(expr: IExpression, datatypes: IDatatype[]) {
        return `type '${Convert.toReadableText([
            inferDatatype(expr),
        ])}' is not assignable to type '${Convert.toReadableText(datatypes)}'.`;
    }

    private static createErrorDetails(text: string) {
        if (
            this.globalExpr.type === "ObjectExpression" ||
            this.globalExpr.type === "ArrayExpression" ||
            this.globalExpr.type === "FunctionExpression"
        ) {
            this.errorDetails.push(text);
        }
    }

    public static factory: Factory = {
        Literal: {
            Identifier: {
                check: (expr: ILiteral, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[<BuiltinTypes>datatype.name].validate(expr.value)
                    ) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 18");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = <IDatatype[]>Storage.Types.get(datatype.name)?.datatypes;
                        return type.some((t) => this.factory[expr.type][t.type].check(expr, t));
                    }

                    return true;
                },
            },
            Literal: {
                check: (expr: ILiteral, datatype: ILiteral) => {
                    console.log("adsfsd");
                    if (expr.value !== datatype.value) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 9");
                        return false;
                    }
                    return true;
                },
            },
            ObjectType: {
                check: (expr: ILiteral, datatype: IObjectType) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    this.notAssignableError("code 10");
                    return false;
                },
            },
            ArrayType: {
                check: (expr: ILiteral, datatype: IArrayType) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    this.notAssignableError("code 11");
                    return false;
                },
            },
            TupleType: {
                check: (expr: ILiteral, datatype: ITupleType) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    this.notAssignableError("code 12");
                    return false;
                },
            },
            FunctionType: {
                check: (expr: ILiteral, datatype: IFunctionType) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    this.notAssignableError("code 36");
                    return false;
                },
            },
        },
        Identifier: {
            Identifier: {
                check: (expr: IIdentifier, datatype: IIdentifier) => {
                    if (Storage.Variables.exist(expr.name)) {
                        const exprRef = <IExpression>Storage.Variables.get(expr.name)?.init;
                        return this.factory[exprRef.type][datatype.type].check(exprRef, datatype);
                    }

                    return true;
                },
            },
            Literal: {
                check: (expr: IIdentifier, datatype: ILiteral) => {
                    return this.factory.Identifier.Identifier.check(expr, datatype);
                },
            },
            ObjectType: {
                check: (expr: IIdentifier, datatype: IObjectType) => {
                    return this.factory.Identifier.Identifier.check(expr, datatype);
                },
            },
            ArrayType: {
                check: (expr: IIdentifier, datatype: IArrayType) => {
                    return this.factory.Identifier.Identifier.check(expr, datatype);
                },
            },
            TupleType: {
                check: (expr: IIdentifier, datatype: ITupleType) => {
                    return this.factory.Identifier.Identifier.check(expr, datatype);
                },
            },
            FunctionType: {
                check: (expr: IIdentifier, datatype: IFunctionType) => {
                    return this.factory.Identifier.Identifier.check(expr, datatype);
                },
            },
        },
        ObjectExpression: {
            Identifier: {
                check: (expr: IObjectExpression, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[<BuiltinTypes>datatype.name].validate(expr)
                    ) {
                        this.notAssignableError("code 19");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = <IDatatype[]>Storage.Types.get(datatype.name)?.datatypes;
                        return type.some((t) => this.factory[expr.type][t.type].check(expr, t));
                    }

                    return true;
                },
            },
            Literal: {
                check: (expr: IObjectExpression, datatype: ILiteral) => {
                    this.notAssignableError("code 15");
                    return false;
                },
            },
            ObjectType: {
                check: (expr: IObjectExpression, datatype: IObjectType) => {
                    let typeWhichDoesntExist = "";
                    const isAllDatatypesExistInPropertys = datatype.properties.every((type) => {
                        const result = expr.properties.some(
                            (property) => property.key.name === type.key.name
                        );

                        if (!result) typeWhichDoesntExist = type.key.name;
                        return result;
                    });

                    if (!isAllDatatypesExistInPropertys) {
                        if (typeWhichDoesntExist) {
                            this.createErrorDetails(
                                `property '${typeWhichDoesntExist}' in missing in type '${Convert.toReadableText(
                                    [inferDatatype(expr)]
                                )}' but require in type '${Convert.toReadableText([datatype])}'.`
                            );
                        }
                        this.notAssignableError("code 20");
                        return false;
                    }

                    let propWhichDoesntExist = "";
                    const isAllPropertysExistInDatatypes = expr.properties.every((prop) => {
                        const result = datatype.properties.some(
                            (type) => type.key.name === prop.key.name
                        );

                        if (!result) propWhichDoesntExist = prop.key.name;
                        return result;
                    });

                    if (!isAllPropertysExistInDatatypes) {
                        if (propWhichDoesntExist) {
                            this.createErrorDetails(
                                `property '${propWhichDoesntExist}' dose not exist in type '${Convert.toReadableText(
                                    [datatype]
                                )}'.`
                            );
                        }

                        this.notAssignableError("code 30");
                        return false;
                    }

                    return expr.properties.every((property) => {
                        return datatype.properties.some((type) => {
                            if (property.key.name === type.key.name) {
                                return type.datatypes.some((t) => {
                                    return this.factory[property.value.type][t.type].check(
                                        property.value,
                                        t
                                    );
                                });
                            }
                        });
                    });
                },
            },
            ArrayType: {
                check: (expr: IObjectExpression, datatype: IArrayType) => {
                    this.notAssignableError("code 16");
                    return false;
                },
            },
            TupleType: {
                check: (expr: IObjectExpression, datatype: ITupleType) => {
                    this.notAssignableError("code 17");
                    return false;
                },
            },
            FunctionType: {
                check: (expr: IObjectExpression, datatype: IFunctionType) => {
                    this.notAssignableError("code 37");
                    return false;
                },
            },
        },
        ArrayExpression: {
            Identifier: {
                check: (expr: IArrayExpression, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[<BuiltinTypes>datatype.name].validate(expr)
                    ) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 28");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = <IDatatype[]>Storage.Types.get(datatype.name)?.datatypes;
                        return type.some((t) => this.factory[expr.type][t.type].check(expr, t));
                    }

                    return true;
                },
            },
            Literal: {
                check: (expr: IArrayExpression, datatype: ILiteral) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    this.notAssignableError("code 13");
                    return false;
                },
            },
            ObjectType: {
                check: (expr: IArrayExpression, datatype: IObjectType) => {
                    this.notAssignableError("code 14");
                    return false;
                },
            },
            ArrayType: {
                check: (expr: IArrayExpression, datatype: IArrayType) => {
                    this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                    return expr.elements.every((element) => {
                        return datatype.datatypes.some((type) => {
                            return this.factory[element.type][type.type].check(element, type);
                        });
                    });
                },
            },
            TupleType: {
                check: (expr: IArrayExpression, datatype: ITupleType) => {
                    if (expr.elements.length !== datatype.datatypes.length) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 21");
                        return false;
                    }

                    return expr.elements.every((element, i) => {
                        const datatypes = datatype.datatypes[i];
                        return datatypes.some((type) => {
                            return this.factory[element.type][type.type].check(element, type);
                        });
                    });
                },
            },
            FunctionType: {
                check: (expr: IArrayExpression, datatype: IFunctionType) => {
                    this.notAssignableError("code 38");
                    return false;
                },
            },
        },
        FunctionExpression: {
            Literal: {
                check: (expr: IFunctionExpression, datatype: ILiteral) => {
                    this.notAssignableError("code 31");
                    return false;
                },
            },
            Identifier: {
                check: (expr: IFunctionExpression, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[<BuiltinTypes>datatype.name].validate(expr)
                    ) {
                        this.notAssignableError("code 35");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = <IDatatype[]>Storage.Types.get(datatype.name)?.datatypes;
                        return type.some((t) => this.factory[expr.type][t.type].check(expr, t));
                    }

                    return true;
                },
            },
            ObjectType: {
                check: (expr: IFunctionExpression, datatype: IObjectType) => {
                    this.notAssignableError("code 32");
                    return false;
                },
            },
            ArrayType: {
                check: (expr: IFunctionExpression, datatype: IArrayType) => {
                    this.notAssignableError("code 33");
                    return false;
                },
            },
            TupleType: {
                check: (expr: IFunctionExpression, datatype: ITupleType) => {
                    this.notAssignableError("code 34");
                    return false;
                },
            },
            FunctionType: {
                check: (expr: IFunctionExpression, datatype: IFunctionType) => {

                    if (expr.params.length > datatype.params.length) {
                        this.notAssignableError("code 42");
                        return false;
                    }

                    const isParamsOk = expr.params.every((param, i) => {
                        if (param.datatypes.length && !this.opetions.allowTypeOverriding) {
                            throw new SyntaxError(
                                `type overriding not allowed in type '${Convert.toReadableText([
                                    inferDatatype(expr),
                                ])}'.`,
                                "code 45"
                            );
                        }

                        if (param.type === "AssignmentPattern") {
                            return datatype.params[i].datatypes.some((type) => {
                                return this.factory[param.right.type][type.type].check(
                                    param.right,
                                    type
                                );
                            });
                        }

                        return true;
                    });

                    if (!isParamsOk) {
                        this.notAssignableError("code 44");
                        return false;
                    }

                    if (expr.returnType.length && !this.opetions.allowTypeOverriding) {
                        throw new SyntaxError(
                            `type overriding not allowed in type '${Convert.toReadableText([
                                inferDatatype(expr),
                            ])}'.`,
                            "code 45"
                        );
                    }

                    const returnedExpressions = FunctionExpression.inferReturnValues(expr);

                    if (
                        !returnedExpressions.length &&
                        expr.returnType.some((t) => t.type === "Identifier" && t.name === T.Void)
                    ) {
                        this.createErrorDetails(
                            `type '${T.Void}' is not assignable to type '${Convert.toReadableText(
                                datatype.returnType
                            )}'.`
                        );
                        this.notAssignableError("code 41");
                        return false;
                    }

                    return returnedExpressions.every((ex) => {
                        return datatype.returnType.some((type) => {
                            return this.factory[ex.type][type.type].check(ex, type);
                        });
                    });
                },
            },
        },
    };
}
