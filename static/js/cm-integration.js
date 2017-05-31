var PCtoJS = function(){};
var PCexe = function(){};

function cmIntegration(){
	// Set codemirror instances
	var myCodeMirrorPC = CodeMirror.fromTextArea(
		document.getElementById("PCt"),
		{
			//mode: 'javascript',
			lineNumbers: true,
			readOnly: false,
			theme: 'ambiance'
		}
	);
	var myCodeMirrorJS = CodeMirror.fromTextArea(
		document.getElementById("JSt"),
		{
			mode: 'javascript',
			lineNumbers: true,
			readOnly: true,
			theme: 'ambiance'
		}
	);
	var myCodeMirrorCONSOLE = CodeMirror.fromTextArea(
		document.getElementById("CONSOLEt"),
		{
			mode: 'javascript',
			lineNumbers: false,
			readOnly: true
		}
	);
	// Atach PC change event
	myCodeMirrorPC.on("change", function(cm, change) {
		PCtoJS();
	});
	window.cms = {
		valid: false,
		pc: myCodeMirrorPC,
		js: myCodeMirrorJS,
		c: myCodeMirrorCONSOLE
	};

	// Wrapper para llamadas al compilador
	PCtoJS = function(){
		window.cms.c.getDoc().setValue("");
		var errors = document.getElementById("errors");
		try {
			var compilation = compile(myCodeMirrorPC.getValue());
			myCodeMirrorJS.getDoc().setValue(compilation);
			errors.innerHTML = "";
			window.cms.valid = true;
		} catch(e){
			window.cms.valid = false;
			errors.innerHTML = e;
		}
	};

	// Wrapper para ejecución via web
	PCexe = function(){
		jailrun(myCodeMirrorJS.getValue(),function(msg){
			myCodeMirrorCONSOLE.getDoc().setValue(myCodeMirrorCONSOLE.getValue()+JSON.stringify(msg, null, '\t')+"\n");
		});
	};

	myCodeMirrorPC.getDoc().setValue(document.getElementById("PCt").value);
	//PCtoJS();
	//PCexe();
}