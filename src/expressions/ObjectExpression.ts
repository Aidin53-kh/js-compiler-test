import { IObjectExpression, IObjectProperty } from "../std";

export class ObjectExpression implements IObjectExpression {
    readonly type = "ObjectExpression";
    constructor(readonly properties: IObjectProperty[]) {}
}
