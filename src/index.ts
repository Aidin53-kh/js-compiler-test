import fs from "fs";
import peggy from "peggy";
import { ASTController } from "./ASTController";
import "./syntax"
import { storage } from "./storage";
import { Identifier } from "./utils/expressions";
import './std'
import { inferDatatype } from "./utils/inferDatatype";
const code = fs.readFileSync("code.ak").toString();
const grammar = fs.readFileSync("grammar.peggy").toString();

const parser = peggy.generate(grammar);
const ast = ASTController.start(parser.parse(code));

// const out = escodegen.generate(ast);
console.dir(storage, { depth: Infinity});


// fs.writeFileSync('output.js', out);


