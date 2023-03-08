import { IDatatype, IArrayType, IObjectType, ITupleType, IObjectTypeProperty } from "../std";
import { Identifier, Literal } from "./expressions";
import { BuiltinError } from "./errors";

export class Dynamic extends Identifier {
    constructor() {
        super("dynamic");
    }
}

export enum T {
    String = "string",
    Int = "int",
    Float = "float",
    Bool = "bool",
    Char = "char",
    Void = "void",
    Dynamic = "dynamic"
}

export class String extends Identifier {
    constructor() {
        super("stirng");
    }
}

export class Int extends Identifier {
    constructor() {
        super("int");
    }
}

export class Float extends Identifier {
    constructor() {
        super("float");
    }
}

export class Bool extends Identifier {
    constructor() {
        super("bool");
    }
}

export class Char extends Identifier {
    constructor() {
        super("char");
    }
}

export class Void extends Identifier {
    constructor() {
        super("void");
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

// TODO: implement function type

export const Type = {
    String,
    Int,
    Float,
    Bool,
    Char,
    Void,
    Dynamic,
    Literal,
    Identifier,
    Object: ObjectType,
    Array: ArrayType,
    Tuple: TupleType,
};

export class DatatypeList {
    public datatyps: IDatatype[] = [];

    constructor(datatypes: IDatatype[]) {
        for (const datatype of datatypes) {
            const typeofDatatype = datatype.type;

            switch (datatype.type) {
                case "Literal":
                    this.datatyps.push(new Literal(datatype.value));
                    break;
                case "Identifier":
                    this.datatyps.push(new Identifier(datatype.name));
                    break;
                case "ObjectType":
                    this.datatyps.push(new ObjectType(datatype.properties));
                    break;
                case "ArrayType":
                    this.datatyps.push(new ArrayType(datatype.datatypes));
                    break;
                case "TupleType":
                    this.datatyps.push(new TupleType(datatype.datatypes));
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
