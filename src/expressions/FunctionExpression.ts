import { Expression } from ".";
import {
    IBlockStatement,
    IDatatype,
    IExpression,
    IFunctionExpression,
    IFunctionParameter,
    IFunctionType,
} from "../std";
import { Convert } from "../utils/Convert";
import { Type } from "../utils/Type";
import { TypeChecker } from "../utils/TypeChecker";
import { T } from "../utils/datatypes";
import { ReferenceError, TypeError } from "../utils/errors";
import { inferDatatype } from "../utils/inferDatatype";
import { Identifier } from "./Identifier";

export class FunctionExpression implements IFunctionExpression {
    public readonly type = "FunctionExpression";

    constructor(
        public readonly id: Identifier | null,
        public readonly params: IFunctionParameter[],
        public readonly body: IBlockStatement,
        public readonly generator: boolean,
        public readonly expression: boolean,
        public readonly async: boolean,
        public readonly returnType: IDatatype[]
    ) {}

    public static inferReturnTypes(fnExpr: IFunctionExpression): IDatatype[] {
        const datatypes: IDatatype[] = [];
        const returnedExpressions = this.inferReturnValues(fnExpr);

        returnedExpressions.map((expr) => datatypes.push(inferDatatype(expr)));
        return datatypes;
    }

    public static inferReturnValues(fnExpr: IFunctionExpression): IExpression[] {
        const returnExpressions: IExpression[] = [];

        for (const statement of fnExpr.body.body) {
            if (statement.type === "ReturnStatement") {
                returnExpressions.push(statement.argument);
            }
        }

        return returnExpressions;
    }

    public static validate(fnExpr: IFunctionExpression): void {
        const names: string[] = [];

        fnExpr.params.map((param) => {
            const paramName = param.type === "AssignmentPattern" ? param.left.name : param.name;

            if (names.includes(paramName)) {
                throw new ReferenceError(`Duplicate parameter '${paramName}'`, "code 39");
            }

            param.datatypes.map((datatype) => Type.validate(datatype));
            if (param.type === "AssignmentPattern") {
                Expression.validate(param.right);
                return names.push(param.left.name);
            }
            names.push(param.name);
        });

        fnExpr.returnType.map((datatype) => Type.validate(datatype));
    }

    public static fullValidate(fnExpr: IFunctionExpression) {
        // fnExpr.params.forEach((param) => {
        //     if (param.type === "AssignmentPattern") {
        //         TypeChecker.check(param.right, param.datatypes);
        //     }
        // });

        if (
            !this.inferReturnValues(fnExpr).length &&
            !fnExpr.returnType.some((t) => t.type === "Identifier" && t.name === T.Void)
        ) {
            throw new TypeError(
                `type 'void' in not assignable to type '${Convert.toReadableText(
                    fnExpr.returnType
                )}'.`,
                "code 7"
            );
        }

        this.inferReturnValues(fnExpr).forEach((expr) => {
            TypeChecker.check(expr, [<IFunctionType>inferDatatype(fnExpr)][0].returnType, {
                allowTypeOverriding: true,
            });
        });
    }

    public static isMyselfDatatypeMatchWithCustomFunctionDatatype(
        fnExprDatatype: IFunctionType,
        fnDatatype: IFunctionType
    ) {}
}
