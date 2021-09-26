# Development

To get this working on my machine (lenovo T430 - Ubuntu 18.04), I had to do the following:

`sudo apt install ruby`

`sudo apt install ruby2.5-dev` <-- ensure this is the right version

`sudo apt install zlib1g-dev`

## Updated for Lenovo T430 - Ubuntu 20.04 - post-upgrade
```
# update the header of /usr/bin/bundler to point at /usr/bin/ruby
# as that now points at the current ruby version

# then, install the new version's dev package
sudo apt install ruby2.7-dev
```

## Serve Locally
To run the site locally, run this while in the root directory of the project:

`bundle exec jekyll serve`

If writing a draft, serve the local site with the --drafts flag

`bundle exec jekyll serve --drafts`

## Templating Language
The name of the Jekyll templating language is [Liquid](https://jekyllrb.com/docs/step-by-step/02-liquid/)

## css Framework
The css framework used for this version is [materializecss](https://materializecss.github.io/materialize/getting-started.html)

To change the colour scheme of the site, do the following:

1. update colours to whatever you're looking for in the file `scss/_materialize-color-variables-override.scss`

2. edit the SASS file `scss/_materialize-variables-override.scss`, changing the colour variables

3. compile the sass files into the final css distributable with the following command:
`npm run css:compile`
