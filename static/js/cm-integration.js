function cmIntegration(){
	var myCodeMirrorPC = CodeMirror.fromTextArea(
		document.getElementById("PCt"),
		{
			mode: 'javascript',
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
			readOnly: false,
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
	myCodeMirrorPC.on("change", function(cm, change) {
		compile();
	});
	window.cms = {
		pc: myCodeMirrorPC,
		js: myCodeMirrorJS,
		c: myCodeMirrorCONSOLE
	};
	myCodeMirrorPC.getDoc().setValue('mostrar "comenzando"\n@base = 0\nmostrar @base\n\nrepetir 5 veces\n\t@base = @base + 2\n\tmostrar @base\n\nmostrar "fin"\n');
	compile();
	jailrun();
}