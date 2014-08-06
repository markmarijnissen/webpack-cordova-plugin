var replace = require('replace');
var path = require('path');
var optimist = require('optimist');
var fs = require('fs');
var mkdirp = require('mkdirp');


function WebpackCordovaPlugin(options){
  this.options = options;
}

WebpackCordovaPlugin.prototype.apply  = function(compiler){
    /**
     * Add commandline flags
     */
    var argv = require('optimist')
      .string('cordova')
      //.string('platform')
      .string('cordova-config')
      .string('cordova-version')
      .argv;


    /**
     * initialize all values: src, config, platform, version
     */
    var context = this.options.context || compiler.options.context || process.cwd();
    var src = argv['cordova'] || this.options.src || "index.html";
    var config = path.join(context,argv['cordova-config'] || this.options.config || "config.xml");
    //var platform = argv['platform'] || this.options.platform;
    var version = argv['cordova-version'] || this.options.version;

    /**
     * Modify webpack config (cordova.js is external, load as script)
     */
    compiler.options.external = compiler.options.external? [compiler.options.external]: [];
    compiler.options.external.push(/cordova(\.js)?$/);

    if(!compiler.options.module.loaders) compiler.options.module.loaders = [];
    compiler.options.module.loaders.push({
      test: /cordova(\.js)?$/,
      loader: 'script-loader'
    });

    /**
     * Modify webpack config: set output to www
     */
    if(!compiler.options.output) compiler.options.output = {};
    compiler.options.output.path = path.normalize(path.join(config,'..','www'));

    /**
     * Make directories and config if needed.
     */
    if(!fs.existsSync(config)){ // sorry for the sync funcion! better ideas are welcome.
      fs.writeFileSync(config, fs.readFileSync(path.join(__dirname,'default-cordova-config.xml')));
      mkdirp(path.normalize(path.join(config,'..','plugins'))); // required cordova dir
      mkdirp(path.normalize(path.join(config,'..','www'))); // required cordova dir
    }

    /**
     * Replace config.xml <content src=...>
     */
    if(compiler.options.reload){
      var ip = compiler.options.reload === true? 'localhost':compiler.options.reload;
      src = "http://" + ip + ":8080/" + src;
    }
    try {
      replace({
        regex: /<content +src="[^"]+\" *\/>/,
        replacement: "<content src=\""+src+"\"/>",
        paths: [config],
        silent: true
      });
    } catch(err) {
      console.error('ERROR webpack-cordova-plugin: Could not replace content src in: '+config,err.code);
    }
    
    /**
     * Replace config.xml version (if specified)
     */
    if(version) {
      // "true" defaults to package.json version
      if(version === true){
        try {
          var packageJsonPath = require.resolve('./package.json');
          version = require(packageJsonPath).version;
        } catch(err){
          console.error('ERROR webpack-cordova-plugin: Could not read version from package.json'+config,err.code);
        }
      }
      try {
        replace({
          regex: /version=\"([0-9]+\.?){1,3}\"/,
          replacement: "version=\""+version+"\"",
          paths: [config],
          silent: true
        });
      } catch(err) {
        console.error('ERROR webpack-cordova-plugin: Could not replace version in: '+config,err.code);
      }
    }

    /**
     * Set correct --content-base for webpack-dev-server
     *
     * Warning! Not yet supported, see https://github.com/webpack/webpack-dev-server/pull/41
     */
    /*
    var iosPath = path.join(context,'platforms','ios','www');
    var androidPath = path.join(context,'platforms','android','assets','www');

    if(platform === "ios" || (platform === undefined && fs.existsSync(iosPath))){
      if(!compiler.options.devServer) compiler.options.devServer = {};
      compiler.options.devServer.contentBase = iosPath;
    } else if(platform === "android" || (platform === undefined && fs.existsSync(androidPath))){
      if(!compiler.options.devServer) compiler.options.devServer = {};
      compiler.options.devServer.contentBase = androidPath;
    }
    */
};

module.exports = WebpackCordovaPlugin;