
// Aquí, sustituyo el window.compile de @bifuer por una función para que sea llamada en el front
// También hay que pasarle a la función por parámetro los objetos de consola de la librería CodeMirror
function compile(PC,cmJS,cmCONSOLE){
	
	// tomamos el PS
	//var PC = document.getElementById("PCt").value;
	// Se divide en lineas, un array con cada linea

	PC = PC.split("\n");
	// Array donde se guardará cada linea de JS resultante
	var JSlines = [];
	// controlador de la tabulacion, guarda la "profundidad" de la ultima linea leida
	var lastDeep = 0;
	//var context = []; // Esto aun no se usa, es para mas adelante mantener control sobre los contextos de las variables para hacer las declaraciones correctamente.
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

	//console.log(PC);
	PC.forEach(function(line,i){
		// para contar las tabulaciones las quitamos y comparamos, compatible tanto con tabulaciones como doble espacio
		var untabLine = line.replace(/^(( {2})+|\t+)/g,"");
		// guardamos la profundidad
		var deep = line.length - untabLine.length;
		// pasamos la linea sin tabular a line que es mas corto el nombre
		line = untabLine;
		// se dispara la sustitución en bateria
		replaces.forEach(function(rule,i){
			line = line.replace(rule[0],rule[1]);
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
				.match(/^procedimiento [^ ]+ /g)[0]
				.replace(/^procedimiento /g,"")
			;
			// ahora teniendo el nombre se compone la cabecera de la función
			line = line
				// se remplaza la primera parte antes de los parametros
				.replace(/^procedimiento [^ ]+ /g,"function "+name+"(")
				// se cambian las 'y' por ',' de los parametros
				.replace(" y ",", ")
			;
			line += "){";
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


	//pasamos el resultado al textarea de JS
	//Esta es la llamada con jsfiddle: document.getElementById("JSt").value = JSlines.join("\n");
	// y se cambia por esta por el tema de la integración con codemirror
	cmJS.getDoc().setValue(JSlines.join("\n"));
	// creamos un funcion global que sustituira a console.log en la "jaula" que vamos a montar
	function consoleReplace(msg){
		// dentro de la jaula los console.log imprimen al textarea de CONSOLE
		// Aquí igual, se sustituye la función para la integración con codemirror
		//document.getElementById("CONSOLEt").value += msg+"\n";
		cmCONSOLE.getDoc().setValue(cmCONSOLE.getValue()+ msg+"\n");
	}
	
	// con control de exceptciones intentamos ejecutar el codigo resultante en una "jaula"
	try {
		// creamos la jaula, consite en una función que se llama a si misma y contiene el codigo a ejecutar
		// la gracia de la jaula es que dentro de esa funcion declaramos un console local con el metodo .log remplazado por la función que ya hemos preparado
		var toEval =
			"(function(){\n"+
			"var console = {log:consoleReplace};\n"+
			JSlines.join("\n")+
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