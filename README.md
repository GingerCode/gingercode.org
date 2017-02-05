![shieldsIO](https://img.shields.io/github/issues/OSWeekends/GingerCode.svg)
![shieldsIO](https://img.shields.io/github/release/OSWeekends/GingerCode.svg)
![shieldsIO](https://img.shields.io/github/license/OSWeekends/GingerCode.svg)
![shieldsIO](https://img.shields.io/david/OSWeekends/GingerCode.svg)

# GingerCode

Sistema de aprendizaje para futuros programadores. 

Se organiza desde el canal #gingercode en Slack


#### Documentación

**Añadelo a tu proyecto de Node.js**
- En tu terminal...
```bash
    npm install gingercode --save
```
- En tu archivo..
```javascript
    var gingercode = require("gingercode");
    
    console.log(gingercode.compile("@contador = 1"));
```

### Tareas

- Testing
```bash
gulp test
```

- Generar gingercode listo para cliente (front)
```bash
gulp client-generation
```

- Linter
```bash
gulp lint
```

## Logros

### v.0.0.2

**Objetivo principal:**
- Aislar el core
- Testear el core
- Añadir tareas para mejorar el desarrollo


**Funcionalidades:**
- Añadidas tareas de Gulp
- Añadido el soporte básico para testear con Jasmine
- Añadido un test general con Jasmine
- Añadido .editorconfig
- Añadido esLint support
- Separación del proyeto en diversos repositorios
- Añadida estructuración de los ficheros y carpetas
- Añadida documentación básica
- Añadida soporte como módulo de NPM


### v.0.0.1

**Notas:**
Solo un "Hola Mundo"
