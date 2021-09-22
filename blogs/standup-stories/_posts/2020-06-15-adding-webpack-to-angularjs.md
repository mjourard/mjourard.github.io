---
title: "Adding Webpack to AngularJS For Better Deployments To S3"
tags: AngularJS Webpack Bundlers
---

AngularJS was the first version of Google's frontend framework [Angular](https://angular.io/). 
It was initially released back in 2010, a lifetime ago in the frontend development community. 
In that time, different tools and standards had evolved to make deploying frontend code easier. 
This article will demonstrate how to integrate the bundler [Webpack](https://webpack.js.org/) into your AngularJS project
to create an easily deployable package with different configurations for different deployment environments (dev/test/prod).

## Audience

This is intended for developers working on a legacy AngularJS application with a familiarity of npm and little to no prior webpack experience.
If you've never used webpack, please give the [webpack getting started](https://webpack.js.org/guides/getting-started/) guide a quick read through to familiarize yourself with webpack concepts.

Also, <strong>do not start new projects using AngularJS</strong>. It's currently [on LTS support that will end on June 30, 2021](https://blog.angular.io/stable-angularjs-and-long-term-support-7e077635ee9c).   
 
## Why Add A Bundler?

Here is a small list of benefits a bundler can provide:

{:.browser-default}
* file concatenation (bundling) 
* dependency resolution
* transpiling and minification
* config value replacements 
* filename updates for cache-busting
* console logging removal

There are many more, and usually you only need to find the right plugin to get webpack to do what you want.

## Getting Started

To start, let's assume you have an AngularJS app with a typical directory structure of consisting of components, services, images, css and AngularJS boilerplate.
For this article, I will be using the AngularJS Phone Gallery tutorial app as an example.

[Google's Repo](https://github.com/angular/angular-phonecat)

[My forked repo with completed webpack example](https://github.com/mjourard/angular-phonecat)

Step zero for adding webpack is going to be making your project npm (or yarn) friendly. 
If you don't have a package.json file yet, run `npm init -y` to create a default one. 

Start by installing webpack as well as creating config files for webpack:
```
npm install -D webpack webpack-cli webpack-dev-server webpack-merge
touch webpack.common.js webpack.dev.js webpack.prod.js
```

The file **webpack.common.js** will be the base webpack config that will contain all the settings that don't change between environments.
**webpack.dev.js** and **webpack.prod.js** will load in **webpack.common.js** and append final values and plugins as necessary.

We'll also need the following plugins to get our AngularJS app working:
```
npm install -D html-webpack-loader css-loader file-loader style-loader copy-webpack-plugin
``` 

An explanation for what each of the plugins do:

{:.browser-default}
* html-webpack-loader: copies over your index.html file into your **dist/** folder, subbing in certain values into the markup
* css-loader: resolves import and require statements of css files within JS and copies the files into your **dist/** folder
* file-loader: resolves asset files (images) import/requires and copies the files into the **dist/** folder
* style-loader: injects css into the DOM
* copy-webpack-plugin: this does a straight copy from your source to your dist folder, we'll need this if we want to avoid adding require scripts everywhere

Now we will add some **npm run** commands to execute webpack with our configs for us.
Within your package.json, add the following object:
{% highlight json %}
"scripts": {
    "build:dev": "webpack --config webpack.dev.js",
    "build:prod": "webpack --config webpack.prod.js",
    "start": "webpack-dev-server --open --config webpack.dev.js"
}
{% endhighlight %} 

Now, we need to add config options to tell webpack:

{:.browser-default}
 1. where our entry point is
 2. how to generate the html file
 3. how to handle our css/asset files  

We'll start with defining a base config in **webpack.common.js**, and then merging it with some basic dev config values.
Place this in your **webpack.common.js** file: 

{% highlight javascript %}
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = title => {
    return {
        entry: {
            app: './app/app.module.js'
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: title,
                template: './app/index.html',
                inject: true
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: './*/**/*.html',
                        to: '[path]/[name].[ext]',
                        context: './app/'
                    },
                    {from: './**/*.css', to: '[path]/[name].[ext]', context: './app/'},
                    {from: 'img/**', to: '[path]/[name].[ext]', context: './app/'}
                ]
            })
        ],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        }
    }
}
{% endhighlight %} 

and place this in your **webpack.dev.js**

{% highlight javascript %}
const merge = require('webpack-merge');
const common = require('./webpack.common');
const path = require('path');

module.exports = merge(common('Dev Google Phone Gallery'), {
    mode: 'development',
    name: 'dev',
    devServer: {
        hot: true,
        compress: true,
        watchOptions: {
            poll: true
        },
        allowedHosts: [
            'localhost'
        ]
    }
})
{% endhighlight %}

A quick rundown of the above in **webpack.common.js**
 
We first **require** in the webpack plugins and npm packages we need to make this work.
Then we define an export module for our webpack config - a function that takes in a single string representing a title value for our AngularJS app, and then defines some plugin behavior.

The **entry** object says where the first file we should load is. 
Make this your app.module.js, with a path relative to your **webpack.common.js** file.

The **plugins** object define the intermediary behavior, with specifics explained below.

Lastly, **output** says where your final bundled files will resolve.
The 'path' property in particular will define the name of your final destination directory of code you can deploy.

#### Plugin Specifics

**HtmlWebPack** will generate the **index.html** for the AngularJS app based on the existing index.html file. 
We'll need to modify it a bit before we run it.

{:.browser-default}
* title is just a variable name used in the template rendering
* template is a relative path for the html template that you want to base your generation from
* inject signifies if variables should be injected into the template itself, we'll be on that in a minute.

**CopyPlugin** will copy over needed files from source to destination, such as css assets and component templates.
This can be avoided with require statements within the source, but we are going for minimal source code changes to integrate webpack so that will be left as an exercise for the reader.

As for the contents of **webpack.dev.js**, it is only loading in the contents of our common file as well as setting up a dev server for hot reloading.

Now we can start modifying our AngularJS source code to be webpack compliant.

## Source Code Modifications

#### index.html

First off, within your existing base **index.html** remove any `<script>` or `<link>` tags of resources, as they will be included during bundling into a single file that will be required by the new **index.html**.
Next, replace the `<title></title>` tag with
 
```<title><%= htmlWebpackPlugin.options.title %></title>```

This will put the value of the **title** property found within the HtmlWebpackPlugin's definition into the template.
> Note: you can pass in arbitrary values this way. 
> In my project, I needed a Google Maps api key within a `<script>` tag, which I set through the HtmlWebpackPlugin object.
> That example can be found [here](https://github.com/mjourard/trick-or-eat-demo/blob/master/frontendTOE/app/index.html) 

Your final index.html should look something like this:
{% highlight html %}
<!doctype html>
<html lang="en" ng-app="phonecatApp">
  <head>
    <meta charset="utf-8">
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
    <div class="view-container">
      <div ng-view class="view-frame"></div>
    </div>
  </body>
</html>
{% endhighlight %}

Real simple.

#### app.module.js

If you ran your webpack config, you'll still get this error:
```
ReferenceError: angular is not defined      app.bundle.js line 870
```
This is because webpack is trying to look at app.module.js amd doesn't see any way to figure out what `angular` is. 
For this reason, we add `require` statements to `app.module.js` pointing to all the libraries we need.
We start with this:
{% highlight javascript %}
'use strict';

// Define the `phonecatApp` module
angular.module('phonecatApp', [
  'ngAnimate',
  'ngRoute',
  'core',
  'phoneDetail',
  'phoneList'
]);
{% endhighlight %}

and we end with this:

{% highlight javascript %}
'use strict';
require('bootstrap/dist/css/bootstrap.css');
require('./app.css');
require('./app.animations.css');

window.jQuery = require('jquery');
const angular = require('angular');
require('angular-animate');
require('angular-resource');
require('angular-route');

// Define the `phonecatApp` module
angular.module('phonecatApp', [
  'ngAnimate',
  'ngRoute',
  'core',
  'phoneDetail',
  'phoneList'
]);

require('./app.config');
require('./app.animations');
require('./core/core.module');
require('./core/checkmark/checkmark.filter');
require('./core/phone/phone.module');
require('./phone-detail/phone-detail.module');
require('./phone-list/phone-list.module');
{% endhighlight %}

> Note: the order of require statements matters for dependency loading, so it matches how it was loaded before in the `index.html` page.

We're also setting window.jQuery to be the result of loading the jquery library because the library itself does not assign itself
to the top-level window object if loaded via require. The angular-animate library breaks without it.

Next, you'll also need to go into the individual *.module.js files within the app and link together the files of the module.
Once you do that, everything should be working...uh oh
```
Possibly unhandled rejection: {"data":"
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"utf-8\">
    <title>Error</title>
</head>
<body>
    <pre>Cannot GET /phones/phones.json</pre>
</body>
</html>","status":404,"config":{"method":"GET",...
```

Ah, it can't find the `phones.json` file which is used by the app to mock http calls to a backend. 
You can confirm this by looking in the `dist/` folder and finding no `phones/` folder.
We'll fix this by adding a pattern to the CopyPlugin:
{% highlight json %}
{"from": "phones/**", "to": "[path]/[name].[ext]", "context": "./app/"}
{% endhighlight %}
Ok, now everything loads without errors in the console and we are seeing the app, but it looks...off:
![Webpack Angular Phonecat Screenshot](/assets/img/webpack_angular_phonecat_no_bs.png)

VS (the original)

![Angular Phonecat Complete Screenshot](/assets/img/webpack_angular_phonecat_complete.png) 

Ah, it's missing bootstrap (as well as some other css files that were initially loaded in index.html).
This is fixed by adding loader rules for css files, which will be handled by the `css-loader` plugin.
You'll create a new **module** object in your webpack config, with a **rules** array that says what files to match for using regex and what type of laoder to use for the matched files.
The object:
{% highlight json %}
"module": {
  "rules": [
    {
      "test": /\.css$/,
      "use": [
        "style-loader",
        "css-loader"
      ]
    },
  ]
}
{% endhighlight %}

Give it a reload and ... it now fails to compile:

```
Entrypoint app = app.bundle.js app.a8f3ffedf81d13734087.hot-update.js
[./app/app.module.js] 597 bytes {app} [built]
[./node_modules/bootstrap/dist/css/bootstrap.css] 1.52 KiB {app} [built]
[./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.eot] 281 bytes {app} [built] [failed] [1 error]
[./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.svg] 425 bytes {app} [built] [failed] [1 error]
[./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf] 284 bytes {app} [built] [failed] [1 error]
[./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff] 284 bytes {app} [built] [failed] [1 error]
[./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2] 284 bytes {app} [built] [failed] [1 error]
[./node_modules/css-loader/dist/cjs.js!./node_modules/bootstrap/dist/css/bootstrap.css] 151 KiB {app} [built]
[./node_modules/css-loader/dist/runtime/api.js] 2.46 KiB {app} [built]
[./node_modules/css-loader/dist/runtime/getUrl.js] 830 bytes {app} [built]
[./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js] 6.64 KiB {app} [built]
    + 53 hidden modules

ERROR in ./node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf 1:0
Module parse failed: Unexpected character '' (1:0)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
(Source code omitted for this binary file)
 @ ./node_modules/bootstrap/dist/css/bootstrap.css (./node_modules/css-loader/dist/cjs.js!./node_modules/bootstrap/dist/css/bootstrap.css) 7:36-88
 @ ./node_modules/bootstrap/dist/css/bootstrap.css
 @ ./app/app.module.js
```

Right, the boostrap css file is going to link to other assets, namely font and icon files. 
No problem, we'll add more rules to load those in:
{% highlight json %}
{
  "test": /\.(png|svg|jpg|gif|ico)$/,
  "use": [
    "file-loader"
  ]
},
{
  "test": /\.(woff|woff2|eot|ttf|otf)$/,
  "use": [
    "file-loader"
  ]
}
{% endhighlight %}
I prefer two objects here to keep the logical types of files separate (image vs font assets).
Ok, getting closer, but still not quite there...probably missing the user-defined css files:
{% highlight javascript %}
require('./app.css');
require('./app.animations.css');
{% endhighlight %}
Alright! Now it looks like the application we started with! 

Our current **webpack.common.js**:
{% highlight javascript %}
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = title => {
    return {
        entry: {
            app: './app/app.module.js'
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: title,
                template: './app/index.html',
                inject: true
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: './**/*.html',
                        to: '[path]/[name].[ext]',
                        context: './app/'
                    },
                    {from: './**/*.css', to: '[path]/[name].[ext]', context: './app/'},
                    {from: 'img/**', to: '[path]/[name].[ext]', context: './app/'},
                    {from: 'phones/**', to: '[path]/[name].[ext]', context: './app/'}
                ]
            })
        ],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                },
            ]
        }
    }
}
{% endhighlight %}

With this, we've loaded everything via webpack in, and we've created a decent angularjs dev environment.
Now we'll create a prod deployment configuration

## Production Config

For this last part, we're going to create a production config that drops all console output. 
If you don't want that for your production code, feel free to start with a base of your **webpack.dev.js** and modify it to fit your needs.

Now, install the plugin for dropping console logging:

```
npm i -D terser-webpack-plugin
```

Next, populate your **webpack.prod.js** file with:
{% highlight javascript %}
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common('Google Phone Gallery'), {
    mode: 'production',
    name: 'prod',
    devtool: 'source-map',
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
        ],
    },
});
{% endhighlight %} 

The above will set some optimizations for webpack during the bundling process, as well as add the TerserPlugin.
This plugin will remove all calls to things like **console.log**.
We've also set the `<title>` tag to be the proper value instead of our dev title.

Now we can run `npm run build:prod` to create a production-quality deployment of our AngularJS app.

And we're done! I hope this tutorial helped you get started with adding webpack to your project's deployment process.
There are many webpack plugins out there for you to customize your deployment however you'd like.
If you'd like to see how I used this setup, you can check that out [here](https://github.com/mjourard/trick-or-eat-demo/blob/master/frontendTOE/webpack.prod_demo.js)

Happy bundling! 

