var project = require("pillars").configure({renderReload:true});

project.services.get("http").start();

project.routes.add(new Route({
  id:'pillarsDocsStatic',
  path:'/*:path',
  directory:{
    path:'./static',
    listing:true
  }
}));