#Killer Loop microsite content

This site is built using the <a href="http://yeoman.io">Yeoman</a> build system. All files in the repo are the _development_ files (unminified, unconcatenated, etc.), the production-ready files are generated in a .gitignore'd /dist directory when the build script is run.

Basic deployment instructions:
* Install Yeoman (really only OS X and *nix for now, though some people have got it running in Windows)
* From the command line, `cd` into the project directory
* `grunt serve` will kick off the preview server and initialize the Live Reload script. 
* Editing the HTML, JS, or SASS files will automatically refresh the site
* *NOTE: DO NOT EDIT CSS DIRECTLY, ALL STYLES SHOULD BE ADDED IN THE main.scss FILE FOR CSS GENERATION
* to run the build script, CTRL-C in the Terminal to stop the preview server, then type `grunt` (or, more likely, `grunt --force` to suppress JavaScript error checking which is WAY too stringent and will halt the build process for as much as an indentation anomaly). The build script will run (JS & CSS files concatenated and minified, images optimized, cachebusters added to filenames)
* A production-ready build of the site will be in /dist at the root of the project directory. Note that /dist is included in .gitignore, so will not be added to version control.