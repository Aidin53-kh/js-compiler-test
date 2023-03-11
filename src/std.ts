import { Identifier } from "./utils/expressions";

export type Code = `code ${string}`;

export interface AST {
    type: "Program";
    body: ASTBody;
}

export type ASTBody = SourceElement[];

export type SyntaxKind = Pick<Statement, "type">["type"];

export type Statement = IVariableDeclaration;

export type SourceElement = Statement | TypeDeclaration;

export interface TypeDeclaration {
    type: "TypeDeclaration";
    id: Identifier;
    datatypes: IDatatype[];
}

export interface IVariableDeclaration {
    type: "VariableDeclaration";
    declarations: IVariableDeclarator[];
    kind: "let" | "const";
    datatypes: IDatatype[];
}

export interface IVariableDeclarator {
    type: "VariableDeclarator";
    id: IIdentifier;
    init: null | IExpression;
    datatypes: IDatatype[];
}
export interface IIdentifier {
    type: "Identifier";
    name: string;
}

export type IExpression =
    | IIdentifier
    | ILiteral
    | IObjectExpression
    | IArrayExpression
    | IFunctionExpression;

export type IExpressionNoIdentifier = ILiteral | IObjectExpression | IArrayExpression;

export interface ILiteral {
    type: "Literal";
    value: ILiteralValue;
}

export type ILiteralValue = string | number | null | boolean;

export type IDatatype = ILiteral | IIdentifier | IObjectType | IArrayType | ITupleType | IFunctionType;

export interface IObjectType {
    type: "ObjectType";
    properties: IObjectTypeProperty[];
}

export interface IObjectTypeProperty {
    key: IIdentifier;
    datatypes: IDatatype[];
}



export interface IArrayType {
    type: "ArrayType";
    datatypes: IDatatype[];
}

export interface ITupleType {
    type: "TupleType";
    datatypes: IDatatype[][];
}

export interface IFunctionType {
    type: "FunctionType";
    params: IIdentifierPattern[];
    body: Statement[];
    returnType: IDatatype[];
}

export interface IObjectExpression {
    type: "ObjectExpression";
    properties: IObjectProperty[];
}

export interface IObjectProperty {
    type: "Property";
    key: IIdentifier;
    value: IExpression;
    kind: "init";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface IArrayExpression {
    type: "ArrayExpression";
    elements: IExpression[];
}

export interface IFunctionExpression {
    type: "FunctionExpression";
    id: Identifier | null;
    params: IFunctionParameter[];
    body: Statement[];
    generator: boolean;
    expression: boolean;
    async: boolean;
    returnType: IDatatype[];
}

export type IFunctionParameter = IAssignmentPattern | IIdentifierPattern;

export interface IAssignmentPattern {
    type: "AssignmentPattern";
    left: IIdentifier;
    right: IExpression;
    datatypes: IDatatype[];
}

export interface IIdentifierPattern extends IIdentifier {
    datatypes: IDatatype[];
}
