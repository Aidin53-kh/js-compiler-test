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

import { TypeError } from "./errors";
import { inferDatatype } from "./inferDatatype";
import { _typeof } from "./typeof";

export type Factory = Record<
    Pick<IExpression, "type">["type"],
    Record<Pick<IDatatype, "type">["type"], { check: (expr: any, datatype: any) => boolean }>
>;

export class TypeChecker {
    private static globalExpr: IExpression;
    private static globalDatatypes: IDatatype[];

    private static error: string;
    private static errorDetails: string[] = [];
    private static code: Code;

    public static check(expr: IExpression, datatypes: IDatatype[]): void {
        this.globalExpr = expr;
        this.globalDatatypes = datatypes;

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
            this.globalExpr.type === "ArrayExpression"
        ) {
            this.errorDetails.push(text);
        }
    }

    private static factory: Factory = {
        Literal: {
            Identifier: {
                check: (expr: ILiteral, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[datatype.name as BuiltinTypes].validate(expr.value)
                    ) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 18");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = Storage.Types.get(datatype.name)?.datatypes as IDatatype[];
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
                    return true;
                },
            },
        },
        Identifier: {
            Identifier: {
                check: (expr: IIdentifier, datatype: IIdentifier) => {
                    if (Storage.Variables.exist(expr.name)) {
                        const exprRef = Storage.Variables.get(expr.name)?.init as IExpression;
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
                    return true;
                },
            },
        },
        ObjectExpression: {
            Identifier: {
                check: (expr: IObjectExpression, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[datatype.name as BuiltinTypes].validate(expr)
                    ) {
                        this.notAssignableError("code 19");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = Storage.Types.get(datatype.name)?.datatypes as IDatatype[];
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
                    return true;
                },
            },
        },
        ArrayExpression: {
            Identifier: {
                check: (expr: IArrayExpression, datatype: IIdentifier) => {
                    if (
                        Type.isBuiltin(datatype.name) &&
                        !Type.builtin[datatype.name as BuiltinTypes].validate(expr)
                    ) {
                        this.createErrorDetails(this.generateNotAssignableText(expr, [datatype]));
                        this.notAssignableError("code 28");
                        return false;
                    }

                    if (Storage.Types.exist(datatype.name)) {
                        const type = Storage.Types.get(datatype.name)?.datatypes as IDatatype[];
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
                    return true;
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
                    return true;
                },
            },
        },
    };
}
