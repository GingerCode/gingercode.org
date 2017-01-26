
function compile(input){

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

	var checkAll =  new RegExp("(?:"+[
		rules.string.source,                                    // 1
		rules.prop.source,                                      // 2
		rules.var.source,                                       // 3
		rules.number.source,                                    // 4
		rules.func.source,                                      // 5
		operators.source,                                       // 6  Math, 7 Logic
		pMathRule.source,                                       // 8  pMath
		pLogicRule.source,                                      // 9  pLogic
		/( y |,)/.source,                                       // 10
		/( +)/.source,                                          // 11
		/(\=)/.source,                                          // 12
		/([a-zA-Z]+)/.source                                    // 13
		// |^\t+
	].join("|")+")","gm");
	console.log(checkAll);

	//var check = new RegExp("(?:"+operands.source+"|"+operators.source+"|"+pOperators.source+")","g");
	var value = new RegExp("(?:"+operands.source+"(?: *"+operators.source+" *"+operands.source+")*)","g");
	var call = 	new RegExp("(?:"+rules.func.source+" +"+operands.source+"(?: *, *"+operands.source+")*)","g");
	var expresion = new RegExp("("+value.source+"|"+call.source+")","g");
	

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


	PC = input.split("\n");
	var JSlines = [], lastDeep = 0, block = false;
	
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
		
		if(deep<lastDeep){
			if(block == "object"){
				line = "};\n" + line;
			} else if(block == "array") {
				line = "];\n" + line;
			} else {
				line = "}\n" + line;
			}
			block = false;
		}
		line = "\t".repeat(deep)+line;
		lastDeep = deep;
		JSlines.push(line);
	});

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
		console.log(e);
	}
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