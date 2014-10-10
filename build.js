module.exports=function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    requirejs: {
      compile: {
        options: {
          baseUrl: "src/",
          paths: {a:"a",b:"b"},
          name: "a",
          optimize: 'closure',
          findNestedDependencies: true,
          out: "dest/<%=pkg.name%>"
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.registerTask('default',['requirejs']);
}