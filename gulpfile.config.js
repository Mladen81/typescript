'use strict';

module.exports = function () {

    this.src='./src/';
    this.dist='./dist/';
    this.temp = './.tmp/';
    this.typings='./typings/';
    this.test='./test/';

    // SRC
    this.images = this.src +'images/';
    this.fonts = this.src +'fonts/';
    this.scripts = this.src +'scripts/';
    this.styles = this.src +'styles/';

    //DIST
    this.imagesDist = this.dist +'images/';
    this.fontsDist = this.dist +'fonts/';
    this.jsDist = this.dist +'js/';
    this.cssDist = this.dist +'css/';

    //TEMP
    this.fontsTemp = this.temp +'fonts/';
    this.jsTemp=this.temp + 'js/';
    this.cssTemp=this.temp + 'css/';
    this.mapsTemp='.';
    this.specTemp=this.temp + 'test/spec/';


    //TEST
    this.spec = this.test +'spec/';


    //FILES
    this.allTsFiles= this.scripts+"**/*.ts";
    this.allTsTestFiles=this.spec+"**/*.ts";
    this.allLessFiles= this.styles+"**/*.less";
    this.allSassFiles= this.styles+"**/*.scss";
    this.allJsFiles=this.temp +'js/**/*.js';
    this.allCssFiles=this.temp +'css/**/*.css';
    this.allImageFiles=this.images +'**/*';
    this.allFontsFiles=this.fonts +'**/*';
    this.allExtraFiles= ['src/*.*','src/scripts/**/*.html','!src/index.html','!src/**/*.map'];

    this.indexHtml=this.src +'index.html';
    this.indexHtmlTemp=this.temp +'index.html';
    this.specRunnerFile = this.test+'specs.html';
    this.typingTsFiles = this.typings + '**/*.ts';
    this.karmaConfFile = this.test+'karma.conf.js';

}
