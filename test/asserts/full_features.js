numero1 = 1;
numero2 = 2;
texto = "Un texto";
union = texto + " y mas texto";
operacion = numero1 * numero2;
condicion = numero1 >= numero2;
operacion = numero1 * numero2;
condicion = numero1 >= numero2;
lista = [1,2,3];
lista2 = [1,2,3];
trabajador = {
	nombre : "Homer",
	id : 123456,
	tags : ["azul","verde","rojo"]
};

console.log(trabajador);

if(1 > 0){
	console.log("A");
} else if(1<0){
	console.log("B");
} else {
	console.log("C");
}

if(numero2 > numero1){
	console.log("Es mayor");
	for(var $=0;$<2;$++){
		console.log("Repitiendo 2");
	}
	if(1){
		a = 1;
	}
}

contador = 0;
for(var $=0;$<5;$++){
	contador = contador + 1;
	console.log(contador);
	
}
while(contador>0){
	contador = contador - 1;
	console.log(contador);
}

for(cosa in lista){
	console.log(cosa);
}

function multiplicar( A,B){
	return A * B;
}

function dividir( A,B){
	return A / B;
}

console.log(multiplicar(2,2));
console.log(dividir(10,5));
