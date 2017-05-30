var project = require("pillars");

project.configure({renderReload:true});


// Pillars trae un servicio http por defecto. Así que lo que hacemos es tomar el servicio, 
// mediante .get('nombre del servicio') y lo arrancamos
project.services.get("http").start();

// Se crea tan solo un directorio estático. Se crea pasándole a la Clase Route en su objeto de configuración
// el parámetro path conla configuración que se ve
var pillarsDocsStatic = new Route({
  id:'pillarsDocsStatic',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
});


// Se añade a project.routes, que es donde están todos los controladores del sistema, 
// el controlador que acabamos de crear y que hemos llamado pillarsDocsStatic
project.routes.add(pillarsDocsStatic);