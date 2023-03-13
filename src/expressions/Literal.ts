import { ILiteral, ILiteralValue } from "../std";

export class Literal implements ILiteral {
    readonly type = "Literal";
    constructor(readonly value: ILiteralValue) {}
}
