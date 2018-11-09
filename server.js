var project = require("pillars").configure({renderReload:true});

project.services.get('http').configure({
    port: process.env.PORT || 3000
}).start();

project.routes.add(new Route({
  id:'pillarsDocsStatic',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
}));
