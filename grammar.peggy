{
  const showLocations = false;
    

  function error(message) {
      const { start } = location();
      console.log(`\n${message} ${start.line}:${start.column}\n`);
      process.exit(1);
  }

  function isDynamic(arr) {
    const f = arr.some(type => {
      if (type.type === "Identifier") {
        if (type.name === "dynamic") return true;
        else return false;
      }
      return false;
    });
    
    if (f) return [ { type: "Identifier", name: "dynamic" } ]
    else return arr;
  }

  function loc() {
    const { start, end } = location();
    return { 
      start: { line: start.line, column: start.column }, 
      end: { line: end.line, column: end.column } 
    }
  }

  function res(result) {
    if (showLocations) result.loc = loc();
    return result;
  }

  function literal(value) {
    return res({ type: "Literal", value });
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }

  function variable(declarations, kind, other) {
      return res({ type: "VariableDeclaration", declarations, kind, ...other });
  }
}

Start = __ program:Program __ { return program } 

/** Helpers **/

SourceCharacter = .

WhiteSpace "whitespace" = "\t" / "\v" / "\f" / " " / "\u00A0" / "\uFEFF"

LineTerminator = [\n\r\u2028\u2029]

SEMI = __ ";" __

__ = [ \t\n\r]*

EOS = __ ";" / WhiteSpace* &"}" / __ EOF

EOF = !.

/** End Helpers **/

/** Tokens **/

// keywords
ConstToken     = "const"     !IdentifierPart
MutToken       = "mut"       !IdentifierPart
TypeToken      = "type"      !IdentifierPart
FnToken        = "fn"        !IdentifierPart
AsyncToken     = "async"     !IdentifierPart
GenToken       = "gen"       !IdentifierPart
ReturnToken    = "return"    !IdentifierPart

// other
TrueToken      = "true"      !IdentifierPart
FalseToken     = "false"     !IdentifierPart
NullToken      = "null"      !IdentifierPart
UndefinedToken = "undefined" !IdentifierPart

// futuer reserved keywords
StructToken    = "struct"    !IdentifierPart

/** End Tokens **/


/** Identifier **/

Identifier "identifier" 
    = id:IdentifierName { return res(id) }

IdentifierName 
    = head:IdentifierStart tail:$IdentifierPart* { return { type: "Identifier", name: head + tail } }

IdentifierStart 
    = "$" / "_" / [a-z]i

IdentifierPart 
    = IdentifierStart / [0-9]

/** End Identifier **/


/** Literals **/

Literal = NumericLiteral / StringLiteral / BooleanLiteral / NullLiteral

NumericLiteral "number"
    = $([0-9]+ "." [0-9]+) { return literal(+text()) } / $[0-9]+ { return literal(+text()) }

StringLiteral "string"
    = '"' value:$(!LineTerminator !'"' @SourceCharacter)* '"' { return literal(value) }

BooleanLiteral "boolean"
    = TrueToken { return literal(true) } / FalseToken { return literal(false) }

NullLiteral "null"
    = NullToken { return literal(null) }

/** End Literals **/


/** Expressions **/

Expression = 
    FunctionExpression / Literal / Identifier / ObjectExpression / ArrayExpression  

ObjectExpression "object expression"
    = "{" __ "}" { return res({ type: "ObjectExpression", properties: [] }) }
    / "{" __ properties:PropertyNameAndValueList __ "}" { 
          return res({ type: "ObjectExpression", properties }) 
      }
    / "{" __ properties:PropertyNameAndValueList __ "," __ "}" { 
          return res({ type: "ObjectExpression", properties }) 
      }

PropertyNameAndValueList
    = head:PropertyAssignment tail:(__ "," __ @PropertyAssignment)* { return [head, ...tail] }

PropertyAssignment 
    = key:PropertyName __ ":" __ value:Expression { 
          return res({ 
              type: "Property", key, value, kind: "init", method: false, shorthand: false, computed: false 
          }) 
      }
    / key:Identifier { 
          return res({ 
              type: "Property", key, value: key, kind: "init", method: false, shorthand: true, computed: false 
          })
      }
    / "[" key:IdentifierName "]" __ ":" __ value:Expression { 
          return res({ 
              type: "Property", key, value, kind: "init", method: false, shorthand: false, computed: true 
          })
      }

PropertyName 
    = StringLiteral / NumericLiteral / IdentifierName

ArrayExpression "array expression"
    = "[" __ elision:(@Elision __)?  "]" { 
          return res({ type: "ArrayExpression", elements: elision || [] }) 
      }
    / "[" __ elements:ElementList __ "]" { 
          return res({ type: "ArrayExpression", elements }) 
      }
    / "[" __ elements:ElementList __ "," __ elision:(@Elision __)? "]" {
          return { type: "ArrayExpression", elements: elements.concat(elision || []) };
      }

ElementList
    = head:(elision:(@Elision __)? element:Expression { return (elision || []).concat(element) })
      tail:(__ "," __ elision:(@Elision __)? element:Expression { return (elision || []).concat(element) })* { 
          return Array.prototype.concat.apply(head, tail); 
      }

Elision 
    = "," commas:(__ ",")* { return new Array(commas.length + 1).fill(null) }

FunctionExpression "function expression"
    = FnToken __ id:(@Identifier __)? "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionExpression", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     false,
              expression:    false,
              async:         false,
              returnType:    returnType || [],
          }
      }
    / AsyncToken WhiteSpace* FnToken __ id:(@Identifier __)? "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionExpression", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     false,
              expression:    false,
              async:         true,
              returnType:    returnType || [],
          }
      }
    / GenToken WhiteSpace* FnToken __ id:(@Identifier __)? __ "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionExpression", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     true,
              expression:    false,
              async:         false,
              returnType:    returnType || [],
          }
      }

/** End Expressions **/


/** Statements **/

Statement 
    = VariableStatement / ExpressionStatement / FunctionDeclaration

VariableStatement "variable statement"
    = ConstToken __ datatypes:VariableDeclarationTypeList? __ declarations:ConstantDeclaratorList EOS { 
          return variable(declarations, "const", { datatypes } ) 
      }
    / ConstToken __ declarations:ConstantDeclaratorList EOS { 
          return variable(declarations, "const", { datatypes: [] } ) 
      }
    / MutToken __ datatypes:VariableDeclarationTypeList? __  declarations:MutableDeclaratorList EOS { 
          return variable(declarations, "var", { datatypes } ) 
      }
    / MutToken __ declarations:MutableDeclaratorList EOS { 
          return variable(declarations, "let", { datatypes: [] } ) 
      }

ConstantDeclaratorList 
    = head:ConstantDeclarator tail:(__ "," __ @ConstantDeclarator)* { return [head, ...tail] }

MutableDeclaratorList 
    = head:MutableDeclarator tail:(__ "," __ @MutableDeclarator)* { return [head, ...tail] }

ConstantDeclarator 
    = id:Identifier init:(__ "=" __ @Expression)? { 
        return res({ type: "VariableDeclarator", id, init }) 
    }

MutableDeclarator 
    = id:Identifier init:(__ "=" __ @Expression)? { 
        return res({ type: "VariableDeclarator", id, init }) 
    }

VariableDeclarationTypeList
  = datatypes:TypeDeclaratorList { return isDynamic(datatypes) }

ExpressionStatement "expression statement"
  = left:Identifier __ "=" __ right:Expression { 
      return res({ 
          type:          "ExpressionStatement", 
          expression:    res({ type: "AssignmentExpression", operator: "=", left, right }) 
      })
    }

Block "block statement" 
    = "{" __ body:Statement* __ "}" { 
        return { type: "BlockStatement", body: body || [] }
    }

FunctionDeclaration "function statement"
    = FnToken __ id:Identifier __ "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionDeclaration", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     false,
              expression:    false,
              async:         false,
              returnType:    returnType || [],
          }
      }
    / AsyncToken WhiteSpace* FnToken __ id:Identifier __ "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionDeclaration", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     false,
              expression:    false,
              async:         true,
              returnType:    returnType || [],
          }
      }
    / GenToken WhiteSpace* FnToken __ id:Identifier __ "(" __ params:(@FormalParameterList __)? ")" 
      returnType:(WhiteSpace* "->" WhiteSpace* @TypeDeclaratorList)? __ body:FunctionBody {
          return { 
              type:          "FunctionDeclaration", 
              id:            id,
              params:        params || [], 
              body:          body,
              generator:     true,
              expression:    false,
              async:         false,
              returnType:    returnType || []
          }
      }

FormalParameterList
  = head:FormalParameter tail:(__ "," __ @FormalParameter)* { 
      return [head, ...tail];
    }

FormalParameterListNoIn
    = head:FormalParameterNoIn tail:(__ "," __ @FormalParameterNoIn)* {
        return [head, ...tail];
    }

FormalParameter
    = datatypes:TypeDeclaratorList __ left:Identifier __ "=" __ right:Expression { 
          return { type: "AssignmentPattern", left, right, datatypes }
      }
    / left:Identifier __ "=" __ right:Expression { 
          return { type: "AssignmentPattern", left, right, datatypes: [] }
      }
    / datatypes:TypeDeclaratorList __ id:Identifier { return { ...id, datatypes } }
    / id:Identifier { return { ...id, datatypes: [] } }

FormalParameterNoIn
    = datatypes:TypeDeclaratorList __ id:Identifier { return { ...id, datatypes } }
    / id:Identifier { return { ...id, datatypes: [] } }

FunctionBody
    = "{" __ body:SourceElements __ "}" { 
        return { type: "BlockStatement", body: body || [] }
    }

ReturnStatement
    = ReturnToken WhiteSpace* argument:Expression EOS {
          return res({ type: "ReturnStatement", argument });
      }

/** End Statements **/


/** Type Declaration **/

TypeDeclaration "type declaration" 
    = TypeToken __ id:Identifier __ "=" __ datatypes:TypeDeclaratorList EOS { 
        return res({ type: "TypeDeclaration", id, datatypes: isDynamic(datatypes) }) 
    }

TypeDeclaratorList 
    = head:TypeDeclarator tail:(__ "|" __ @TypeDeclarator)* { return [head, ...tail] }

TypeDeclarator 
    = FunctionType / ArrayType / Literal / ObjectType / SingleType / TupleType 

SingleType "type" 
    = Identifier

ObjectType "object type"
    = "{" __ "}" { return res({ type: "ObjectType", properties: [] })}
    / "{" __ properties:ObjectTypePropertyList __ "}" { 
          return res({ type: "ObjectType", properties })
      }
    / "{" __ properties:ObjectTypePropertyList __ "," __ "}" { 
          return res({ type: "ObjectType", properties })
      }

ObjectTypePropertyList
    = head:ObjectTypeProperty tail:(__ "," __ @ObjectTypeProperty)* {
        return [head, ...tail]
    }

ObjectTypeProperty
    = datatypes:VariableDeclarationTypeList __ key:Identifier {
        return { key, datatypes }
    }

ArrayType "array type"
    = "(" __ datatypes:TypeDeclaratorList __ ")" WhiteSpace* "[]" { 
          return res({ type: "ArrayType", datatypes }) 
      }
    / datatype:(TupleType / Literal / ObjectType / SingleType / FunctionType) WhiteSpace* "[]" { 
          return res({ type: "ArrayType", datatypes: Array.of(datatype) })
      }

TupleType "tuple type"
    = "[" __ "]" { return res({ type: "TupleType", datatypes: [] })}
    / "[" __ datatypes:TupleTypeDeclarationList __ "]" {
          return res({ type: "TupleType", datatypes: datatypes })
      }

TupleTypeDeclarationList 
    = head:TypeDeclaratorList tail:(__ "," __ @TypeDeclaratorList)* {
        return [head, ...tail];
    }

FunctionType "function type"
    = "(" __ "(" __ params:(@FormalParameterListNoIn __)? ")" WhiteSpace* "->" WhiteSpace+ returnType:TypeDeclaratorList __ ")" {
          return res({ type: "FunctionType", params: params || [], returnType });
      }
    / "(" __ params:(@FormalParameterListNoIn __)? ")" WhiteSpace* "->" WhiteSpace+ returnType:TypeDeclaratorList {
          return res({ type: "FunctionType", params: params || [], returnType });
      }

/** End Type Declaration **/

/** Program **/

SourceElement
    = TypeDeclaration / Statement 

SourceElements
    = head:SourceElement tail:(__ @SourceElement)* { return [head, ...tail] }

Program 
    = body:SourceElements? { return { type: "Program", body: optionalList(body) } }

/** End Program **/
