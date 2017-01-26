
// replaces guarda parejas de string/regexp y su sustitución para pasarlas de forma sencilla a cada linea
var replaces = [
	[" es igual que ",     " == "],   [" igual que ",        " == "],
	[" es mayor que ",     " > "],    [" mayor que ",        " > "],
	[" es menor que ",     " < "],    [" es menor que ",     " < "],
	[" es mayor que ",     " > "],    [" es mayor que ",     " > "],
	[" es menor que ",     " <= "],   [" es menor que ",     " <= "],
	[" es distinto que ",  " != "],   [" distinto que ",      " != "],
	[" no es ",                " != "],
	[" es falso",             " == false"],
	[" es cierto",            " == true"],
	[" falso",                " false"],
	[" cierto",               " true"],
	[" y ademas ",             " && "], [" O ",               " && "],
	[" o si ",                 " || "], [" Y ",               " || "],
];

// Transforma un string de entrada, linea a linea, a su transpilacion JS
function compile(input){
	PC = input.split("\n");
	var JSlines = []; // Array de lineas de resultado
	var lastDeep = 0; // La "profundidad" en tabulaciones de la ultima linea analizada
	var functions = [];
	var variables = [];
	PC.forEach(function(line,i){ // Recorrido por cada linea del código
		line = line.replace(/^( {2})+/,"\t"); // Transforma cualquier "doble espacio" en \t
		//console.log(line,(line.match(/^\t+/) || [""])[0].length);
		var deep = (line.match(/^\t+/) || [""])[0].length; // Guarda la profundidad de tabulación de la linea
		line = line.replace(/^\t+/,""); // Limpiamos cualquier tabulación inicial de la linea

		replaces.forEach(function(rule,i){
			line = line.replace(rule[0],rule[1]); // Sustitución en bateria, se siguen las reglas de sustitución declaradas en replaces.
		});

		// ifs para cada estructura, las llaves de cierre se gestionan aparte gracias al control de tabulaciones
		if(line.match(/^si no$/g)){
			// elses
			line = line.replace(/^si no$/g," else { ");
		} else if(line.match(/^si /g)){
			// if
			line = line.replace(/^si /g,"if ( ");
			line += " ){";
		} else if(line.match(/^pero si /g)){
			// elseif
			line = line.replace(/^pero si /g," else if ( ");
			line += " ){";
		} else if(line.match(/^@/g)){
			// declaraciones de variables
			line = "var "+line;
			line += ";";
		} else if(line.match(/^mostrar /g)){
			// mostrar -> console.log
			line = line.replace(/^mostrar /g,"console.log(");
			line += ");";
		} else if(line.match(/^repetir si /g)){
			// while
			line = line.replace(/^repetir si /g,"while (");
			line += "){";
		} else if(line.match(/^repetir [0-9]+ /g)){
			// for de 0 a un numero dado
			line = line.replace(/^repetir /g,"for (var i=0;i<");
			line = line.replace(/ veces$/g,";i++){");
		} else if(line.match(/^procedimiento /g)){
			// declaracion de funciones
			// esto extrae el nombre de la funcion, primero extrae hasta donde aparece el nombre y despues elimina la palabra procedimiento.
			var name = line
				.match(/^procedimiento \#[^ ]+ /g)[0]
				.replace(/^procedimiento /g,"")
			;
			// ahora teniendo el nombre se compone la cabecera de la función
			line = line
				// se remplaza la primera parte antes de los parametros
				.replace(/^procedimiento \#[^ ]+ /g,"function "+name+"(")
				// se cambian las 'y' por ',' de los parametros
				.replace(" y ",", ")
			;
			line += "){";
			functions.push(name);
		} else if(line.match(/^devolver /g)){
			// returns
			line = line.replace(/^devolver /g,"return ");
			line += ";";
		}

		// ahora se eliminan todas las @ de los nombres de variable.
		line = line.replace(/@/g,"");
		
		// se comprueba si la profundidad actual es menor que la ultima (es decir, se ha cerrado un bloque)
		if(deep<lastDeep){
			// si es asi se cierra la llave del bloque y se añade un retorno de carro
			line = "}\n" + line;
		}
		// como trabajamos con la version sin tabular, volvemos a tabular ya que sabemos la profundidad
		line = "\t".repeat(deep)+line;
		// pasamos al contexto global esta profundidad como la ultima
		lastDeep = deep;
		// añadimos la linea pasada a JS al array correspondiente
		JSlines.push(line);
	}); // Fin del forEach


	/*

	var regExpElements = {
		var: /([\@][a-zA-Z\_\-][a-zA-Z\_\-0-9]*)/,
		prop: /(\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]*){2,}/,
		number: /(\-?[0-9]+(?:\.[0-9])?)/,
		string: /((?:\"(?:(?:\\\")|[^\"])*\")|(?:\'(?:(?:\\\')|[^\'])*\'))/,
		logic: /(\>\=|\<\=|\=\=|\!\=|\>|\<)/,
		mod: /(\!)/,
		math: /(\+|\-|\*|\/|\%)/,
		conditional: /(si no |pero si|si )/,
		loop: /(repetir si |repetir |por cada | en )/,
		reserved: /(procedimiento |definir | y |mostrar |devolver)/,
		pLogic: pLogicRule,
		pMod: /( no es )/,
		pMath: pMathRule,
	};
//var operands = "("+regExpElements.var+"|"+regExpElements.var;
//var expresion = /((?:[\#][a-zA-Z\_\-][a-zA-Z\_\-0-9]*)|(?:(?:)|(?:)))/;
*/

var pLogics = [
	["es mayor o igual que","="],
	["mayor o igual que",">="],
	["mayor o igual",">="],
	["es menor o igual que","<="],
	["menor o igual que","<="],
	["menor o igual","<="],
	["es igual que","=="],
	["igual que","=="],
	["igual","=="],
	["es distinto que","!="],
	["distinto que","!="],
	["distinto","!="],
	["es mayor que",">"],
	["mayor que",">"],
	["mayor",">"],
	["es menor que","<"],
	["menor que","<"],
	["menor","<"]
];
var pMaths = [
	["menos","-"],
	["mas","+"],
	["multiplicado por","*"],
	["por","*"],
	["dividido entre","/"],
	["dividido","/"],
	["resto entre","%"],
	["resto","%"]
];

var pLogicRule = "";
pLogics.forEach(function(v,i){
	if(i>0){
		pLogicRule+="|";
	}
	pLogicRule += ""+v[0]+"";
});
pLogicRule = new RegExp("("+pLogicRule+")");

var pMathRule = "";
pMaths.forEach(function(v,i){
	if(i>0){
		pMathRule+="|";
	}
	pMathRule += ""+v[0]+"";
});
pMathRule = new RegExp("("+pMathRule+")");

var rules = {
	string: /((?:\"(?:(?:\\\")|[^\"])*\")|(?:\'(?:(?:\\\')|[^\'])*\'))/,
	prop: /((?:\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]*)+)/,
	var: /(\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]*)/,
	func: /([\#][a-zA-Z\_\-][a-zA-Z\_\-0-9]*)/,
	number: /(\-?[0-9]+(?:\.[0-9]+)?)/,
	//mod: [/(\!)/,/( no es )/]
};



var operators =  new RegExp("(?:"+[
	/(\+|\-|\*|\/|\%)/.source,
	/(\>\=|\<\=|\=\=|\!\=|\>|\<)/.source
].join("|")+")");

var operands = new RegExp("(?:"+[
	rules.string.source,
	rules.prop.source,
	rules.var.source,
	rules.number.source
].join("|")+")");

var checkAll =  new RegExp("(?:"+[
	rules.string.source,                                    // 1
	rules.prop.source,         // 2
	rules.var.source,              // 3
	rules.number.source,                                    // 4
	rules.func.source,            // 5
	operators.source,                                       // 6  Math, 7 Logic
	pMathRule.source,                                       // 8  pMath
	pLogicRule.source,                                      // 9  pLogic
	/( y |,)/.source,                                       // 10
	/( +)/.source,                                          // 11
	/(\=)/.source,                                          // 12
	/([a-zA-Z]+)/.source                                    // 13
	// |^\t+
].join("|")+")","gm");

//var check = new RegExp("(?:"+operands.source+"|"+operators.source+"|"+pOperators.source+")","g");
var value = new RegExp("(?:"+operands.source+"(?: *"+operators.source+" *"+operands.source+")*)","g");
var call = 	new RegExp("(?:"+rules.func.source+" +"+operands.source+"(?: *, *"+operands.source+")*)","g");
var expresion = new RegExp("("+value.source+"|"+call.source+")","g");



console.log(checkAll);
//console.log(call);
//console.log(expresion);

var sentences = {
	asign: new RegExp("^(definir )? *"+rules.var.source+" +\\= +"+expresion.source+" *$"),
	struct: new RegExp("^(definir )? *"+rules.var.source+" *$"),
	list: new RegExp("^(definir )? *"+rules.var.source+" +\\= +("+expresion.source+"(?: *, *"+expresion.source+")+) *$"),
	if: new RegExp("^si +"+expresion.source+" *$"),
	elseif: new RegExp("^pero si +"+expresion.source+" *$"),
	else: new RegExp("^si no +"+expresion.source+" *$"),
	for: new RegExp("^repetir +"+expresion.source+"( +veces)? *$"),
	while: new RegExp("^repetir si +"+expresion.source+" *$"),
	foreach: new RegExp("^\\* cada +"+rules.var.source+" +en +"+rules.prop.source+" *$"),
	function: new RegExp("^(procedimiento +)?"+rules.var.source+"( +"+rules.prop.source+"(?: *, *"+rules.prop.source+")*)? *$"),
	print: new RegExp("^(mostrar|imprimir) +"+expresion.source+" *$"),
	return: new RegExp("^(devolver|enviar) +"+expresion.source+" *$")
};

JSlines = [];
var block = false;
PC.forEach(function(line,i){
	line = line.replace(/^( {2})+/,"\t"); // Transforma cualquier "doble espacio" en \t //console.log(line,(line.match(/^\t+/) || [""])[0].length);
	var deep = (line.match(/^\t+/) || [""])[0].length; // Guarda la profundidad de tabulación de la linea
	line = line.replace(/^\t+/,""); // Limpiamos cualquier tabulación inicial de la linea

	//console.log(value.exec(line));

	var iresult,r;
	var lineCopy = "";
	var lengthDiff = 0;
	while (checkAll.global && (iresult = checkAll.exec(line))!== null) {
		if(iresult[8]){
			for(r = 0; r < pMaths.length; r++){
				if(pMaths[r][0]==iresult[8]){
					lengthDiff += pMaths[r][1].length - pMaths[r][0].length;
					lineCopy += pMaths[r][1];
					break;
				}
			}
		} else if(iresult[9]){
			for(r = 0; r < pLogics.length; r++){
				if(pLogics[r][0]==iresult[9]){
					lengthDiff += pLogics[r][1].length - pLogics[r][0].length;
					lineCopy += pLogics[r][1];
					break;
				}
			}
		} else if(iresult[10]){
			lengthDiff += 1 - iresult[10].length;
			lineCopy += ",";
		/*
		} else if(iresult[2] || iresult[3] || iresult[5]){
			var replaced = iresult[0].substring(1).replace("@",".");
			lineCopy += replaced;
			lengthDiff += replaced.length - iresult[0].length;
		*/
		} else {
 			lineCopy += iresult[0];
 		}
	}

	if(line.length + lengthDiff == lineCopy.length){
		line = lineCopy;
		if(line===""){
			line = "";
		} else if(line.match(sentences.asign)){
			if(block == "object"){
				line = line.replace(sentences.asign,"$2 : $3,");
			} else {
				line = line.replace(sentences.asign,"$2 = $3;");
			}
		} else if(line.match(sentences.struct)){
			line = line.replace(sentences.struct,"$2 = {");
			block = "object";
		} else if(line.match(sentences.list)){
			if(block == "object"){
				line = line.replace(sentences.list,"$2 : [$3],");
			} else {
				line = line.replace(sentences.list,"$2 = [$3];");
			}
		} else if(line.match(sentences.if)){
			line = line.replace(sentences.if,"if($1){");
			block = true;
		} else if(line.match(sentences.elseif)){
			line = line.replace(sentences.elseif,"} else if($1){");
			block = true;
		} else if(line.match(sentences.else)){
			line = line.replace(sentences.else,"} else {");
			block = true;
		} else if(line.match(sentences.for)){
			line = line.replace(sentences.for,"for(var _i=0;_i<$1;_i++){");
			block = true;
		} else if(line.match(sentences.while)){
			line = line.replace(sentences.while,"while($1){");
			block = true;
		} else if(line.match(sentences.foreach)){
			line = line.replace(sentences.foreach,"for($1 in $2){");
			block = true;
		} else if(line.match(sentences.function)){
			line = line.replace(sentences.function,"function $2($3){");
			block = true;
		} else if(line.match(sentences.print)){
			line = line.replace(sentences.print,"console.log($2);");
		} else if(line.match(sentences.return)){
			line = line.replace(sentences.return,"return  $2;");
		} else {
			line = "// ERROR (sentencia): "+line;
		}
	} else {
		line = "// ERROR (sintaxis): "+line;
	}

	/*

	control de bloque
		anidar multiples niveles
		hacer bloques para listas
		filtrar sentencias validas en el bloque

	Montar al reves, primero comprobación de sentencias en bruto, con control de bloques (flujo de sentencias)
	guiar las comprobaciones, sustituir la base de la sentencia y finalmente hacer la sustitución general de expresiones.

	Estaria genial poder "decir" lo que el usuario esta escribiendo, seguir los tipos de sentencia para dar outputs mas amigables

	*/

	// se comprueba si la profundidad actual es menor que la ultima (es decir, se ha cerrado un bloque)
	if(deep<lastDeep){
		// si es asi se cierra la llave del bloque y se añade un retorno de carro
		if(block == "object"){
			line = "};\n" + line;
		} else if(block == "array") {
			line = "];\n" + line;
		} else {
			line = "}\n" + line;
		}
		block = false;
	}
	// como trabajamos con la version sin tabular, volvemos a tabular ya que sabemos la profundidad
	line = "\t".repeat(deep)+line;
	// pasamos al contexto global esta profundidad como la ultima
	lastDeep = deep;
	// añadimos la linea pasada a JS al array correspondiente
	JSlines.push(line);
}); // Fin del forEach



// ^((definir )?\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]+)|(?:\t+(\@[a-zA-Z\_\-][a-zA-Z\_\-0-9]+)\s*\=\s*)|(mostrar|repetir)
// La siguiente funciona bastante bien, detecta todos los tipos de elemento posibles y los cataloga
// (\t+)|(\"[^\"]*\")|(\'[^\']*\')|([0-9]+)|([\@\#][a-zA-Z\_\-][a-zA-Z\_\-0-9]+)|( ?[\=\+\-\*\%\/] ?)|( es mayor o igual que | mayor o igual que | es menor o igual que | menor o igual que | es mayor que | mayor que | es menor que | menor que | es igual que | igual que | no es | es distinto que | distinto que | no )|(\>\=|\<\=|\>|\<|\=\=|\!\=|\!)|(mostrar |repetir |veces|definir | y |si )|([\r\n]*)
// Version con casi todo, valida por expressiones todo el string.
// ((\t+)|(\"[^\"]*\")|(\'[^\']*\')|(\-?[0-9]+)|(verdadero|falso)|([\@\#][a-zA-Z\_\-][a-zA-Z\_\-0-9]+)|( ?[\=\+\-\*\%\/] ?)|( es mayor o igual que | mayor o igual que | es menor o igual que | menor o igual que | es mayor que | mayor que | es menor que | menor que | es igual que | igual que | no es | es distinto que | distinto que | no )|(\>\=|\<\=|\>|\<|\=\=|\!\=|\!)|(repetir si |repetir | veces|si no|pero si |si )|(procedimiento |definir | y |mostrar )|([\r\n]+)|( +))
/*
Ginger (definición del lenguaje)
Una regexp general valida la linea completa para confirmar que la sintaxis es, inicialmente, valida.
A continuación se valida el tipo de sentencia de la que se trata:
					
Las sentencias pueden ser:
	[definir] @numero = {expresion}\n                                        // define una variable con su valor, se trataran todas como globales
	[definir] @persona\n                                                     // define un objeto literal, inicia un bloque
	[definir] @lista = {expresion} (y|,) {expresion} [(y|,) {expresion}]\n   // define una lista
	si {expresion}\n                                                         // if, inicia un bloque
	pero si {expresion}\n                                                    // elseif, requiere if, inicia un bloque
	si no\n                                                                  // else, requiere if, inicia un bloque, implica !elseif
	repetir {expresion:int} [veces]\n                                        // for(contador), inicia un bloque
	repetir si {expresion}\n                                                 // while, inicia un bloque
	por cada @value en @values\n                                             // foreach, mientras que @values sea una lista, @value toma secuancialmente cada valor de la misma
	[procedimiento] #multiplicar [@uno [(y|,) @dos]]\n                       // definición de funcion, inicia un bloque
	#multiplicar [{expresion} [(y|,) {expresion}]]                           // llamada a funcion (es valida como expresion pero no combinable)
	(mostrar | imprimir) {expresion}
	(devolver | enviar) {expresion}

Sentencia precedida de tabulacion:
  \t+{sentencia}\n
  El nivel de tabulación solo puede ser 0 o un nivel mayor o igual a la linea anterior
  Si es un nivel mayor debe estar abierto algun tipo de bloque
  Solo en el caso del objeto literal se limitan las sentencias posibles dentro del bloque a declaraciones de variables

Operadores:
	Logicos: Todos los operadores logicos pueden ir en su forma simbolica como en lenguaje natural, todos siguen la misma regla:
		>=
		es mayor o igual que
		mayor o igual que
		mayor o igual
	Matematicos: los operadores matematicos se usaran preferentemente en su forma simbolica, pero podran ser:
		-   | menos
		+   | mas
		*   | por       | multiplicado por
		/   | dividido  | dividido entre
		%   | resto     | resto entre

Rutina de expresiones:
	Operandos: Una variable, una propiedad, un numero o un string (@aZ|@aZ@aZ|-?0-9|""|'') 
	Operadores: Todos los logicos y matematicos
	Una expresion consiste en la sucesion de operandos y operadores o un solo operando, o una llamada a procedimiento/funcion

*/

	return JSlines.join("\n"); // Devolver todas las lineas de resultado como un solo string
}

function jailrun(source,consoleReplace){
	// con control de exceptciones intentamos ejecutar el codigo resultante en una "jaula"
	window.cms.c.getDoc().setValue("");
	try {
		// creamos la jaula, consite en una función autoejecutable con una closure que reemplaza a console.
		// dentro de la "jaula" cualquier llamada a console.log sera redirigida a consoleReplace
		var toEval =
			"(function(){\n"+
			"var console = {log:consoleReplace};\n"+
			window.cms.js.getValue()+
			"})();";
		// ejecutamos la "jaula"
		eval(toEval);
	} catch(e){
		// si existe un error pasamos el mismo al textarea CONSOLE
		consoleReplace("Error en el código!\n"+e);
		// pasamos tb el codigo de la jaula para poder comprobarlo
		consoleReplace(toEval);
		// de paso enviamos el objeto de error a la consola real
		console.log(e);
	}
}