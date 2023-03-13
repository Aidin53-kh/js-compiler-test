import {
    IDatatype,
    IArrayType,
    IObjectType,
    ITupleType,
    IObjectTypeProperty,
    IFunctionType,
    IIdentifierPatternOptionalIdentifier,
} from "../std";
import { Identifier } from "../expressions/Identifier";
import { Literal } from "../expressions/Literal";
import { BuiltinError } from "./errors";

export enum T {
    String = "string",
    Int = "int",
    Float = "float",
    Bool = "bool",
    Char = "char",
    Void = "void",
    Dynamic = "dynamic",
}

export class Dynamic extends Identifier {
    constructor() {
        super("dynamic");
    }

    public static validate(input: string): boolean {
        return true;
    }
}

export class String extends Identifier {
    constructor() {
        super("stirng");
    }

    public static validate(input: string): boolean {
        return typeof input === "string";
    }
}

export class Int extends Identifier {
    constructor() {
        super("int");
    }

    public static validate(input: string): boolean {
        return typeof input === "number" && (input / Math.ceil(input) === 1 || input === 0);
    }
}

export class Float extends Identifier {
    constructor() {
        super("float");
    }

    public static validate(input: string): boolean {
        return typeof input === "number";
    }
}

export class Bool extends Identifier {
    constructor() {
        super("bool");
    }

    public static validate(input: string): boolean {
        return typeof input === "boolean";
    }
}

export class Char extends Identifier {
    constructor() {
        super("char");
    }

    public static validate(input: string): boolean {
        return typeof input === "string" && input.length === 1;
    }
}

export class Void extends Identifier {
    constructor() {
        super("void");
    }

    public static validate(input: string): boolean {
        return false;
    }
}

export class ObjectType implements IObjectType {
    readonly type = "ObjectType";
    constructor(readonly properties: IObjectTypeProperty[]) {}
}

export class ArrayType implements IArrayType {
    readonly type = "ArrayType";
    constructor(readonly datatypes: IDatatype[]) {}
}

export class TupleType implements ITupleType {
    readonly type = "TupleType";

    constructor(readonly datatypes: IDatatype[][]) {}
}

export class FunctionType implements IFunctionType {
    readonly type = "FunctionType";
    constructor(
        readonly params: IIdentifierPatternOptionalIdentifier[],
        readonly returnType: IDatatype[]
    ) {}
}

// TODO: implement function type

export class DatatypeList {
    public datatypes: IDatatype[] = [];

    constructor(datatypes: IDatatype[]) {
        for (const datatype of datatypes) {
            const typeofDatatype = datatype.type;

            switch (datatype.type) {
                case "Literal":
                    this.datatypes.push(new Literal(datatype.value));
                    break;
                case "Identifier":
                    this.datatypes.push(new Identifier(datatype.name));
                    break;
                case "ObjectType":
                    this.datatypes.push(new ObjectType(datatype.properties));
                    break;
                case "ArrayType":
                    this.datatypes.push(new ArrayType(datatype.datatypes));
                    break;
                case "TupleType":
                    this.datatypes.push(new TupleType(datatype.datatypes));
                    break;
                case "FunctionType":
                    this.datatypes.push(new FunctionType(datatype.params, datatype.returnType));
                    break;
                default:
                    new BuiltinError(
                        `'${typeofDatatype}' not implemented in 'DatatypeList' class.`,
                        "code b2"
                    );
            }
        }
    }
}
