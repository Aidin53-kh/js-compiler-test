import { IArrayExpression, IExpression } from "../std";

export class ArrayExpression implements IArrayExpression {
    readonly type = "ArrayExpression";
    constructor(readonly elements: IExpression[]) {}
}
