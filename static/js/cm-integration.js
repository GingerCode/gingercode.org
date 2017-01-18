function cmIntegration(){
	var myCodeMirrorPC = CodeMirror.fromTextArea(
		document.getElementById("PCt"),
		{
			mode: 'javascript',
			lineNumbers: true,
			readOnly: false
		}
	);
	
	var myCodeMirrorJS = CodeMirror.fromTextArea(
		document.getElementById("JSt"),
		{
			mode: 'javascript',
			lineNumbers: true,
			readOnly: false
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
		compile(cm.getValue(),myCodeMirrorJS,myCodeMirrorCONSOLE);
	});
}