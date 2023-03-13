import { IIdentifier } from "../std";

export class Identifier implements IIdentifier {
    readonly type = "Identifier";
    constructor(readonly name: string) {}
}
