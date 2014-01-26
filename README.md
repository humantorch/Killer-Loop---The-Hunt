This was a project built in late 2013 for Minivegas. The live version of the project has been significantly changed by the client's internal development team since my inital build went live, so a build of the project as it stood when I handed it off is available at <a href="http://killerloop.prayingmadness.com">killerloop.prayingmadness.com</a>. Since all front-end files in that build are concatenated and minified (and, as such, are mostly unreadable) this repo contains unminified JS and SASS files.

This project pushed HTML5 &lt;video&gt; in directions it was never supposed to go, integrating live camera-angle switching at one point in the video, allowing the user to choose which angle to view a stunt from. This was accomplished through a technique similar to a graphic sprite sheet, where all the camera angles were contained in one video file and "changing the camera angle" redirects the user to a new point in the video timeline. I've seen this used with audio files but, to the best of my knowledge, I'm the only developer in the history of the universe to attempt it with video. It resulted in a pretty long preloader since the entire video file needed to be loaded in order for timeline jumping to work accurately and smoothly, which introduced it's own host of issues since every browser implements video preloading differently. Chrome, oddly, was the _worst_ offender here and required a signficant amount of hacking to force it into submission.

Up until the site was handed off to the client and deployed live I was the sole developer on the project.

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
