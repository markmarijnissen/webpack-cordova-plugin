# webpack-cordova-plugin
> Output webpack to a Cordova app.

## Usage

```js
var CordovaPlugin = require('webpack-cordova-plugin');

new CordovaPlugin({
  config: 'config.xml',  // Location of Cordova' config.xml (will be created if not found)
  src: 'index.html',     // Set entry-point of cordova in config.xml
  platform: 'ios', (or 'android') // Set `webpack-dev-server` to correct `contentBase` to use Cordova plugins.
  version: true,         // Set config.xml' version. (true = use version from package.json)
});
```

## Getting started

1. Install `cordova` and the `webpack-cordova-plugin`

  ```bash
  npm install -g cordova 
  npm install --save-dev webpack-cordova-plugin
  ```

2. Add the plugin to your `webpack.config.js`

3. Run `webpack`. It wil automatically create the Cordova `config.xml`.

4. Modify the app bundle ID in `config.xml` 

5. Launch cordova!

   ```bash
   cordova platforms add ios # or android
   cordova run ios
   ```

## Load Cordova

In order for Cordova to load correctly, your `index.html` must explictly refer to the `cordova.js` script.

1. Create an `index.html` and make sure this is copied to your output:
   ```js
   require('file?name=index.html!./index.html');
   ```

2. Include the `cordova.js` script in your index.html:
    ```js
    <script type="text/javascript" src="cordova.js"></script>
    ```

## Under the hood

* `--output-path` is set to the correct `www` directory.
* `cordova.js` is declared as external.
* `cordova.js` is loaded as script.
* `config.xml` is updated (version and entry-point)
* `--content-base` is updated to the correct platform (e.g. `/platforms/android/assets/www`)

## Changelog

#### 0.1.3 (31/10/2014)

* Enabled `platform` configuration and commandline option to set correct content base of dev server.
* Cordova is installed in `process.cwd()` rather than the `context`.

#### 0.1.2 (06/08/2014)

* added `www` as required cordova directory

#### 0.1.1 (05/08/2014)

* Added `script-loader` as peer dependency.

#### 0.1.0 (05/08/2014)
