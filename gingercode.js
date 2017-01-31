
var rules = {
	string: /((?:\"(?:(?:\\\")|[^\"])*\")|(?:\'(?:(?:\\\')|[^\'])*\'))/,
	prop: /((?:\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]*)+)/,
	var: /(\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]*)/,
	func: /([\#][a-zA-Z\_\-][a-zA-Z\_\-0-9]*)/,
	number: /(\-?[0-9]+(?:\.[0-9]+)?)/,
	logic: /(\>\=|\<\=|\=\=|\!\=|\>|\<)/,
	math: /(\+|\-|\*|\/|\%)/,
	comma: /( y |,)/,
	space: /( +)/,
	asign: /(\=)/,
	words: /([a-zA-Z]+)/
};

var pLogics = [
	["es mayor o igual que",">="],["mayor o igual que",">="],["mayor o igual",">="],
	["es menor o igual que","<="],["menor o igual que","<="],["menor o igual","<="],
	["es mayor que",">"],["mayor que",">"],["mayor",">"],
	["es menor que","<"],["menor que","<"],["menor","<"],
	["es distinto que","!="],["distinto que","!="],["distinto","!="],["no es","!="],
	["es igual que","=="],["igual que","=="],["igual","=="],["es","=="]
];

var pMaths = [
	["menos","-"],
	["mas","+"],["sumar","+"],["sumado","+"],
	["multiplicado por","*"],["multiplicado","*"],
	["dividido entre","/"],["dividido","/"],
	["resto entre","%"],["resto","%"]
];

var pLogicRule = [];
pLogics.forEach(function(v,i,a){pLogicRule[i]=v[0];});
pLogicRule = new RegExp("("+pLogicRule.join("|")+")");

var pMathRule = [];
pMaths.forEach(function(v,i,a){pMathRule[i]=v[0];});
pMathRule = new RegExp("("+pMathRule.join("|")+")");

var operators =  new RegExp("(?:"+[
	rules.logic.source,
	rules.math.source,
	pLogicRule.source,
	pMathRule.source
].join("|")+")");

var operands = new RegExp("(?:"+[
	rules.string.source,
	rules.prop.source,
	rules.var.source,
	rules.func.source,
	rules.number.source
].join("|")+")");

var checkAll =  new RegExp("(?:"+[
	operands.source,
	operators.source,
	rules.comma.source,
	rules.space.source,
	rules.asign.source,
	rules.words.source
].join("|")+")","gm");
//console.log(checkAll);

var value = new RegExp("(?:"+operands.source+"(?: *"+operators.source+" *"+operands.source+")*)","g");
var call = 	new RegExp("(?:"+rules.func.source+" +("+operands.source+"(?: *(?: y |,) *"+operands.source+")*))","g");
var expresion = new RegExp("("+value.source+"|"+call.source+")","g");

var sentences = {
	asign: new RegExp("^(definir )? *"+rules.var.source+" +\\= +"+expresion.source+"$"),
	struct: new RegExp("^(definir )? *"+rules.var.source+"$"),
	list: new RegExp("^(definir )? *"+rules.var.source+" +\\= +("+expresion.source+"(?: *(?: y |,) *"+expresion.source+")+)$"),
	if: new RegExp("^si +"+expresion.source+"$"),
	elseif: new RegExp("^pero si +"+expresion.source+"$"),
	else: new RegExp("^si no$"),
	for: new RegExp("^repetir +"+expresion.source+"( +veces)?$"),
	while: new RegExp("^repetir si +"+expresion.source+"$"),
	foreach: new RegExp("^por cada +"+rules.var.source+" +en +"+rules.prop.source+"$"),
	function: new RegExp("^(procedimiento +)?"+rules.func.source+"( +"+rules.prop.source+"(?: *(?: y |,) *"+rules.prop.source+")*)?$"),
	print: new RegExp("^(mostrar|imprimir) +"+expresion.source+"$"),
	return: new RegExp("^(devolver|enviar) +"+expresion.source+"$"),
	expresion: new RegExp("^"+expresion.source+"$")
};


function compile(input){
	var PC = (input+"\n").split("\n");
	var JSlines = [];
	var blocklist = [];
	var block;
	var lastClosedBlock;
	var indentTypes = [/\t/,/( {2})/];
	var indentType,indentTypeReplace;

	var blockDeep;
	var indent;

	try {
		PC.forEach(function(line,i){
			indent = 0;
			if(line.match(/^\s+/) && !indentType){
				indentTypes.forEach(function(r,i){
					if(line.match(new RegExp("^"+r.source+"+"))){
						indentType = new RegExp("^"+r.source+"+");
						indentTypeReplace = r;
					}
				});
				if(!indentType){
					throw "Tipo de indentación no válido, linea "+(i+1);
				}
			}

			blockDeep = blocklist.length;
			indent = indentType?(line.match(indentType) || [""])[0].replace(indentTypeReplace,"\t").length:0;
			line = line.replace(indentType,"");
			
			if(indent>blockDeep){
				throw "Indentación escesiva, linea "+(i+1);
			} else if(line.match(/^\s+/)){
				throw "Indentación mixta o incorrecta, linea "+(i+1);
			} else if(line.match(/\s+$/)){
				throw "Espacios en blanco sobrantes a final de linea, linea "+(i+1);
			}
			
			if(indent<blockDeep){
				for(var di = 0;di<blockDeep-indent;di++){
					lastClosedBlock = blocklist.pop();
					if(lastClosedBlock == "struct"){
						removeLastComma(JSlines);
						JSlines.push("\t".repeat(blocklist.length)+"};");
					} else {
						JSlines.push("\t".repeat(blocklist.length)+"}");
					}
				}
			}

			block = blocklist[blocklist.length-1];

			if(line === "") {
				// nothing
			} else if(lastClosedBlock=="if" && line.match(sentences.elseif)){
				removeLastIf(JSlines);
				line = line.replacer(sentences.elseif,function(match,g,i){
					return "} else if("+g[0]+"){";
				});
				blocklist.push("if");
			} else if(lastClosedBlock=="if" && line.match(sentences.else)){
				removeLastIf(JSlines);
				line = line.replacer(sentences.else,function(match,g,i){
					return "} else {";
				});
				blocklist.push("else");
			} else if(block == "struct"){
				if(line.match(sentences.asign)){
					line = line.replacer(sentences.asign,function(match,g,i){
						return g[1]+" : "+g[2]+",";
					});
				} else if(line.match(sentences.list)){
					line = line.replacer(sentences.list,function(match,g,i){
						return g[1]+" : ["+g[2]+"],";
					});
				} else {
					line = "// Sentencia no valida en este bloque";
				}
			} else if(line.match(sentences.asign)){
				line = line.replacer(sentences.asign,function(match,g,i){
					return g[1]+" = "+g[2]+";";
				});
			} else if(line.match(sentences.struct)){
				line = line.replacer(sentences.struct,function(match,g,i){
					return g[1]+" = {";
				});
				blocklist.push("struct");
			} else if(line.match(sentences.list)){	
				line = line.replacer(sentences.list,function(match,g,i){
					return g[1]+" = ["+g[2]+"];";
				});
			} else if(line.match(sentences.if)){
				line = line.replacer(sentences.if,function(match,g,i){
					return "if("+g[0]+"){";
				});
				blocklist.push("if");
			} else if(line.match(sentences.for)){
				line = line.replacer(sentences.for,function(match,g,i){
					return "for(var $=0;$<"+g[0]+";$++){";
				});
				blocklist.push("loop");
			} else if(line.match(sentences.while)){
				line = line.replacer(sentences.while,function(match,g,i){
					return "while("+g[0]+"){";
				});
				blocklist.push("loop");
			} else if(line.match(sentences.foreach)){
				line = line.replacer(sentences.foreach,function(match,g,i){
					return "for("+g[0]+" in "+g[1]+"){";
				});
				blocklist.push("loop");
			} else if(line.match(sentences.function)){
				line = line.replacer(sentences.function,function(match,g,i){
					return "function "+g[1]+"("+g[2]+"){";
				});
				blocklist.push("function");
			} else if(line.match(sentences.print)){
				line = line.replacer(sentences.print,function(match,g,i){
					return "console.log("+g[1]+");";
				});
			} else if(line.match(sentences.return)){
				line = line.replacer(sentences.return,function(match,g,i){
					return "return "+g[1]+";";
				});
			} else {
				line = "// ERROR: "+line;
			}

			if(line !== ""){
				lastClosedBlock = false;
			}
			line = "\t".repeat(indent) + line;
			JSlines.push(line);

		});
	} catch(e){
		JSlines.push("\t".repeat(indent)+"// "+e);
	}

	return JSlines.join("\n");
}

function jailrun(source,consoleReplace){
	window.cms.c.getDoc().setValue("");
	try {
		var toEval =
			"(function(){\n"+
			"var console = {log:consoleReplace};\n"+
			window.cms.js.getValue()+
			"})();";
		eval(toEval);
	} catch(e){
		consoleReplace("Error en el código!\n"+e);
		consoleReplace(toEval);
		//console.log(e);
	}
}

function removeLastIf(JSlines){
	for(var li=JSlines.length-1;li>=0;li--){
		if(JSlines[li]!==""){
			JSlines.splice(li,1);
			break;
		}
	}
}

function removeLastComma(JSlines){
	for(var li=JSlines.length-1;li>=0;li--){
		if(JSlines[li]!==""){
			JSlines[li] = JSlines[li].slice(0,-1);
			break;
		}
	}
}

function replacePS(sentence){
	
	// console.log(value.exec(line));
	// 1 String, 2 prop, 3 var, 4 func, 5 number
	// 6  Logic, 7 Math, 8 PLogic y 9 PMath
	// 10 comma
	// 11 spaces
	// 12 asign op
	// 13 reserved words (any word)

	var iresult,r;
	var result = "";
	var isCall = call.exec(sentence);
	if(isCall){
		result = isCall[1].substring(1)+"("+replacePS(isCall[2])+")";
	} else {
		while (checkAll.global && (iresult = checkAll.exec(sentence))!== null) {
			if(iresult[9]){
				for(r = 0; r < pMaths.length; r++){
					if(pMaths[r][0]==iresult[0]){
						result += pMaths[r][1];
						break;
					}
				}
			} else if(iresult[8]){
				for(r = 0; r < pLogics.length; r++){
					if(pLogics[r][0]==iresult[0]){
						result += pLogics[r][1];
						break;
					}
				}
			} else if(iresult[10]){
				result += ",";
			} else if(iresult[2] || iresult[3] || iresult[4]){
				result += iresult[0].substring(1).replace(/\@|\#/,".");
			} else {
				result += iresult[0];
			}
		}
	}
	return result;
}

String.prototype.replacer = function(rule,callback){
	return this.replace(rule,function(){
		var l = arguments.length;
		var match = arguments[0];
		var groups = [];
		var offset = arguments[l-2];
		var input = arguments[l-1];
		for(var i=1;i<arguments.length-2;i++){
			groups.push(replacePS(arguments[i]));
		}
		return callback.call(this,match,groups,offset,input);
	});
};


module.exports = {
	rules, pLogics, pMaths, pLogicRule, pMathRule, operators, operands, checkAll, value, call, expresion, sentences, compile, jailrun, removeLastIf, removeLastComma, replacePS
};