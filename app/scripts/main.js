/*jslint browser: true, devel: true, camelcase: false */
/*global Modernizr, $, Popcorn, screenfull, mobileOS, BrowserDetect, videojs, Tock */

var KL = KL || {};

KL.Global = (function (window, document, undefined) {
    'use strict';
    var self = {

        isiPhone: false,
        isiPad: false,
        isIE8: false,

        init: function() {
            // wow, that's a lot of variables
            var fallbackmode = false, // detect for <video> support and/or mobile phone, play fallback if true
                fbvid = document.getElementById('fallbackvideo').innerHTML,
                $kl_vid = document.getElementById('kl_vid'),
                mp4sup = Modernizr.video ? (!!document.createElement('video').canPlayType('video/mp4')) : null, //detect support for MP4 video
                vidsrc = mp4sup ? 'mp4' : 'webm',
                vidaddr = 'https://s3-eu-west-1.amazonaws.com/thehunt/kl-interactive-26.11.'+vidsrc,
                iOSvidaddr = 'https://s3-eu-west-1.amazonaws.com/thehunt/kl-interactive-ios-26.11.'+vidsrc,
                mp4size = 68539429, // size of the video files in bytes (needed for accurate preloader because browsers are dumb)
                webmsize = 29728187, // size of the video files in bytes (needed for accurate preloader because browsers are dumb)
                vidsize = vidsrc === 'mp4' ? mp4size : webmsize,
                xhr = new XMLHttpRequest(),
                $nav = $('nav'),
                $navli = $nav.find('li'), // camera angle icons
                $scrubber = $('#scrubber'), // <progress> meter for video scrubber
                tc, // used to parse data-timecode attribute for camera angle buttons
                counter = 0, // used for invisible counter
                cDisplay = $('.ms').find('span'),
                $stopwatch = $('#stopwatch').find('.countup'),
                playtime, // used for invisible counter
                introend = 85.57, // length (in seconds) of the intro sequence
                slowmo = 9.57, // length (in seconds) of the slowmo sequence
                slowmoend = introend+slowmo, // total length of intro + slowmo
                numberofsegments = 9, // number of camera angle segments
                viewswaptime = 16.94, // length (in seconds) of each individual interactive segment
                interactiveend = 247.66, // video counter (in seconds) at the end of all interactive segments where lead-out begins
                leadouttime = 23.39, // length of the leadout segment
                totaltime = introend+slowmo+viewswaptime+leadouttime, // total playtime of the video (intro + slowmo + 1*interactive + leadout)
                TOUCH = (Modernizr.touch),
                CLICK = TOUCH ? 'touchend' : 'click', // touch devices will use 'touchend' rather than 'click' to avoid the 300ms delay
                elem = $('#fsvid')[0], // for full-screen video
                $fsb = $('#fs'),
                $vol = $('#volume'); // for full-screen video

            // DEBUGGING HACKS
            // show interactive timer and video controls
            if (document.location.hash === '#timer') {
                $('.ms').css('display','inline-block');
                $kl_vid.controls = true;
            }
            // mute video onload
            if (document.location.hash === '#mute') {
                $kl_vid.muted = true;
            }

            // Stopwatch is used to control the displayed video timer.
            $stopwatch.stopwatch();


            // set fallbackmode to true for mobile phones or IE8
            self.isiPhone = (navigator.platform.indexOf('iPhone') !== -1);

            if ((self.isiPhone || (mobileOS === 'Android' && window.outerWidth < 641)) || $('html').hasClass('lt-ie9')) {
                fallbackmode = true;
            }

            if (fallbackmode) {
                $('#kl_vid, #videoshare, nav, .controlbar button, .controlbar span').remove();
                $('#videoblock').after(fbvid);

                if ($('html').hasClass('lt-ie9')) {
                    videojs('kl_vid', {}, function(){});
                }
            }

            /************************
            * ANIMATION CONTROLLER
            ************************/

            // Tock is used to run a timer during the interactive sequence. It was much more accurate and less prone to floating-point errors than a simple setTimeout() call.
            var tick = new Tock({
                callback: function () {
                    $('.ms span').text(tick.lap()/1000);
                }
            });


            /************************
            * VIDEO AJAX DOWNLOAD
            ************************/
            var popcorn = fallbackmode ? null : new Popcorn('#kl_vid');
            // for ipads

            


            /************************
            * halfLoad()
            * Uses popcorn and <video> preload to detect how much of the file has downloaded
            * and start playing when 50% of the file has preloaded.
            * NOTE: not used in IE or Chrome, this is Safari only.
            ************************/

            function halfLoad() {
            // store the returned timeRanges object as we use it more than once
                var buff = popcorn.buffered();
                // if we have buffered more then half the video
                if ( buff.length > 0 && buff.end(0) > ( popcorn.duration() / 2 ) ) {
                    $('.aperture-6').addClass('displayed');
                    $('#aperture').text('100%');
                    $('#videoblock').fadeOut('slow');
                    setTimeout(function() {
                        $('#play').click();
                    },500);
                } else {
                    if ( buff.length > 0) {
                        var loadedpercent = ((buff.end(0) / ( popcorn.duration() / 2 )*100).toFixed(0));

                        // Populate preloader with percentage of the video loaded (times 2 since we're only loading half of it)
                        // and show the corresponding camera iris piece.
                        // TODO: DRY-ify this, since it happens multiple times in the file
                        $('#aperture').text(loadedpercent+'%');

                        if (loadedpercent >= 17 && loadedpercent <= 34) {
                            $('.aperture-1').addClass('displayed');
                        }
                        if (loadedpercent >= 35 && loadedpercent <= 50) {
                            $('.aperture-2').addClass('displayed');
                        }
                        if (loadedpercent >= 51 && loadedpercent <= 67) {
                            $('.aperture-3').addClass('displayed');
                        }
                        if (loadedpercent >= 68 && loadedpercent <= 84) {
                            $('.aperture-4').addClass('displayed');
                        }
                        if (loadedpercent >= 85) {
                            $('.aperture-5').addClass('displayed');
                        }
                    }
                    // Check every second for amount loaded
                    setTimeout( halfLoad, 1000 );
                }
            }

            /************************
            * iOSVideoUpdate()
            * This is for iOS only. This function is kicked off on iPads when playback is triggered by the user (since iOS won't autoplay).
            * Works roughly the same as the other loading functions with a few other iOS-necessary changes.
            * Checks for load progression and starts playing the video when 60% of it has downloaded.
            ************************/

            function iOSVideoUpdate() {
                var percentageBuffered = 0,
                    percentdisplayed;

                if ($kl_vid.buffered.length > 0 && $kl_vid.buffered.end && $kl_vid.duration) {
                    percentageBuffered = $kl_vid.buffered.end(0) / ($kl_vid.duration * 0.3);
                    // console.log('if buff', percentageBuffered);
                    if (percentageBuffered < 1) {
                        percentdisplayed = parseInt(percentageBuffered*100,10);
                        console.log(percentageBuffered);
                    } else {
                        percentdisplayed = 100;
                    }

                    // Oh hi! Yet another instance of populating/animating the loader. *sigh*                   
                    $('#aperture').text(percentdisplayed+'%');
                    if (percentdisplayed+8 >= 17 && percentdisplayed+8 <= 34) {
                        $('.aperture-1').addClass('displayed');
                    }
                    if (percentdisplayed+8 >= 35 && percentdisplayed+8 <= 50) {
                        $('.aperture-2').addClass('displayed');
                    }
                    if (percentdisplayed+8 >= 51 && percentdisplayed+8 <= 67) {
                        $('.aperture-3').addClass('displayed');
                    }
                    if (percentdisplayed+8 >= 68 && percentdisplayed+8 <= 84) {
                        $('.aperture-4').addClass('displayed');
                    }
                    if (percentdisplayed+8 >= 85) {
                        $('.aperture-5').addClass('displayed');
                    }

                } else if ($kl_vid.bytesTotal !== undefined && $kl_vid.bytesTotal > 0 && $kl_vid.bufferedBytes !== undefined) {
                    percentageBuffered = $kl_vid.bufferedBytes / $kl_vid.bytesTotal;
                }

                if (percentageBuffered >= 1) { // 100% of the video has been buffered
                    $('.aperture-6').addClass('displayed');
                    $('#aperture').text('100%');
                    $('#videoblock').fadeOut('normal',function() {
                        $(document.body).addClass('huntloaded');
                    });
                    
                    $('#play').on(CLICK, function() {
                        var isPaused = $kl_vid.paused;
                        if (isPaused) {
                            $kl_vid.play();
                            $('#play').find('i').toggleClass('ahem');
                        } else {
                            $kl_vid.pause();
                            $('#play').find('i').toggleClass('ahem');
                            tick.stop();
                        }
                    });
                    $stopwatch.stopwatch('start');
                    $kl_vid.play();
                    $('#play').find('i').toggleClass('ahem');
                    $kl_vid.removeEventListener('progress', iOSVideoUpdate, false);
                }
            }


            if (mobileOS === 'iOS') {
                $kl_vid.src = iOSvidaddr;
                $('.controlbar').find('button').fadeIn();
            } else {
                if (BrowserDetect.browser === 'Chrome') {
                    /************************
                    * Chrome has an absolutely abysmal implementation of 'preload="auto"' and only preloads content up to about 5%
                    * of the total filesize beyond the playhead. I suppose it makes sense (protecting the user from huge, 
                    * unnecessary downloads) but caused massive issues in this case.
                    *
                    * Via XHR request the video is downloaded as a binary blob, and once the download has completed, plug that 
                    * blob URL into the <video> `src` attribute. Unfortunately, this requires the entire file to be downloaded 
                    * before playback can begin, a half-finished blob can't be rendered out by the browser.
                    ************************/

                    var updateProgress = function(e) {
                        if (e.lengthComputable) {
                            var loadedpercent = (parseInt((e.loaded / vidsize )*100,10)),
                                $aperture = $('#aperture');
                            $aperture.text(loadedpercent+'%');
                            // The Return of the Son of the Preloader. Argh.
                            if (loadedpercent+8 >= 17 && loadedpercent+8 <= 34) {
                                $('.aperture-1').addClass('displayed');
                            }
                            if (loadedpercent+8 >= 35 && loadedpercent+8 <= 50) {
                                $('.aperture-2').addClass('displayed');
                            }
                            if (loadedpercent+8 >= 51 && loadedpercent+8 <= 67) {
                                $('.aperture-3').addClass('displayed');
                            }
                            if (loadedpercent+8 >= 68 && loadedpercent+8 <= 84) {
                                $('.aperture-4').addClass('displayed');
                            }
                            if (loadedpercent+8 >= 85) {
                                $('.aperture-5').addClass('displayed');
                            }
                        }
                    };

                    $('#videoblock').fadeIn();
                    xhr.open('GET', vidaddr, true);
                    xhr.responseType = 'blob';
                    xhr.onprogress = updateProgress;
                    xhr.onload = function() {
                        // log('xhr');
                        if (this.status === 200) {
                            // console.log('video downloadeded');
                            var myBlob = this.response,
                                vid = window.URL.createObjectURL(myBlob);
                            // myBlob is now the blob that the object URL pointed to.
                            $('.aperture-6').addClass('displayed');
                            setTimeout(function() {
                                $('#videoblock').fadeOut('normal',function() {
                                    $(document.body).addClass('huntloaded');
                                });
                                $kl_vid.src = vid;
                                $kl_vid.addEventListener('error', function(err){
                                    console.log(err);
                                    // Will throw a MediaError code 4
                                });
                                $('#play').click();
                            },500);
                            $('.controlbar').find('button').fadeIn();
                        }
                    };

                    xhr.onerror = function(e) {
                        alert('Error ' + e.target.status + ' occurred while receiving the document.');
                    };

                    xhr.send();
                } else if (BrowserDetect.browser === 'Explorer') {
                    // None of the preloading techniques used for other browsers worked with IE to nobody's surprise ever.
                    // IE won't play a binary blob, won't wait until half the video is preloaded to start playing, and basically
                    // just threw a hissyfit at everything else I tried.
                    // The only other option I could think of was to manually set a predetermined amount of time for the video to start
                    // preloading before playing and hope for the best. Currently set for 12 seconds, can be adjusted in the
                    // `iePause` variable set below.
                    $(document.body).addClass('isanyie');
                    $('#videoblock').fadeIn();
                    var current = 0,
                        finish = 100,
                        rate = 1,
                        iePause = 12000, // Amount of time for IE to preload before starting to play
                        iecounter = setInterval(function(){
                            if(current >= finish) {
                                clearInterval(iecounter);
                            }
                            // Another instance of populating/animating the loader. Another need for DRY-ification.
                            $('#aperture').text(current+'%');
                            if (current+8 >= 17 && current+8 <= 34) {
                                $('.aperture-1').addClass('displayed');
                            }
                            if (current+8 >= 35 && current+8 <= 50) {
                                $('.aperture-2').addClass('displayed');
                            }
                            if (current+8 >= 51 && current+8 <= 67) {
                                $('.aperture-3').addClass('displayed');
                            }
                            if (current+8 >= 68 && current+8 <= 84) {
                                $('.aperture-4').addClass('displayed');
                            }
                            if (current+8 >= 85) {
                                $('.aperture-5').addClass('displayed');
                            }
                            current = parseInt(current,10) + parseInt(rate,10);
                        }, (iePause-500) / (finish / rate));
                    setTimeout(function() {
                        $('.aperture-6').addClass('displayed');
                        $('#play').click();
                        $('#videoblock').fadeOut();
                        $(document.body).addClass('huntloaded');
                    },iePause);
                } else if (BrowserDetect.browser === 'Safari' || BrowserDetect.browser === 'Firefox') {
                    // Safari and Firefox use the `halfLoad()` function declared up ^ there somewhere
                    $('#videoblock').fadeIn();
                    $kl_vid.src = vidaddr;
                    halfLoad();
                }
                else { // Fallback in case all of the above doesn't work because of reasons
                    $kl_vid.src = vidaddr;
                    setTimeout(function() {
                        $('#play').click();
                    },12000);
                }
            }

            /************************
            * POPCORN JS
            * http://popcornjs.org/
            ************************/
            if (!fallbackmode) {
                popcorn
                .code({
                    start: 0.1,
                    onStart: function() {
                        $('.controlbar button, .scrubcontainer, .stopwatch').css('visibility','visible');
                        $scrubber.on(CLICK, function(e) {
                            var offset = $(this).offset(),
                                clickspot = e.clientX - offset.left,
                                scrubwidth = ($('#scrubber').width()), //920 at 100% width
                                vidpoint = (clickspot / scrubwidth);

                            $kl_vid.currentTime = introend * vidpoint;
                            $scrubber.attr('value',vidpoint*100);
                            $stopwatch.stopwatch('stop').stopwatch('destroy').stopwatch({startTime: ((introend * vidpoint)*1000)}).stopwatch('start');
                        });
                    }
                })
                .code({
                    start: 1,
                    onStart: function() {
                        if ($('.videoblock').is(':visible')) {
                            $('.videoblock').fadeOut('fast');
                        }
                    }
                })
                .code({
                    start: 265.9,
                    onStart: function() {
                        // reserved in case element fadein needs to be staggered                        
                    },
                    end: 266.9,
                    onEnd: function() {
                        $('#videoshare, #vidshareh2, #replay, .vidsharebtn').fadeIn();
                    }
                }).code({
                    start: introend,
                    onStart: function() {
                        $nav.addClass('shown');
                        $navli.removeClass('visuallyhidden');
                        $scrubber.off('click');

                        $nav.on(CLICK, 'li', function() {
                            $kl_vid.currentTime = slowmoend-0.1;
                            $nav.data('clicked',$(this).data('timecount'));
                        });
                        $(document.body).on('keyup.camera',function(e) {
                            if((e.keyCode > 48 && e.keyCode < 55) || (e.keyCode === 48) || (e.keyCode === 75) || (e.keyCode === 76)) {
                                $nav.find('[data-keycode='+e.keyCode+']').click();
                                // console.log('398. keyCode: '+e.keyCode);
                            }
                        });
                        setTimeout(function() {
                            $navli.addClass('fadeIn');
                        }, 1);
                    },
                    end: slowmoend,
                    onEnd: function() {
                        $('#play').hide();
                        tick.start();
                        $('cam1 button').addClass('active');
                        $nav.addClass('intsec');
                        $nav.off().on(CLICK, 'li', function() {
                            $nav.find('button').removeClass('active');
                            $(this).find('button').addClass('active');
                            tc = parseInt($(this).data('timecount'), 10)*viewswaptime;
                            playtime = parseFloat(cDisplay.text());
                            $kl_vid.currentTime = parseFloat(tc+slowmoend+playtime);
                        });

                        if ($nav.data('clicked')) {
                            var stopwatchtime = slowmoend*1000;
                            $('.videocontainer').fadeTo('fast',0.5, function() {
                                $navli.eq($nav.data('clicked')).click();
                                $('.videocontainer').fadeTo('fast',1);
                                $stopwatch.stopwatch('destroy');
                                $stopwatch.stopwatch({startTime: stopwatchtime}).stopwatch('start');
                            });
                        }
                        setTimeout(function() {
                            $kl_vid.currentTime = interactiveend;
                            $navli.removeClass('fadeIn').off(CLICK);
                            $nav.find('.active').removeClass('active');
                            $('#play').show();
                            $nav.removeClass('shown');
                            $(document.body).off('keyup.camera');
                        }, viewswaptime*1000);
                    }
                }).on('ended', function() {
                    $stopwatch.stopwatch('stop');
                    $(document.body).addClass('videoEnded');
                    $navli.addClass('visuallyhidden');
                    $nav.removeAttr('class');
                });
            }


            /************************
            * EVENT HANDLERS
            ************************/

            $(document.body).one(CLICK, '#kl_vid', function() {
                $('.unsupported').remove();
            });

            // Play button
            $('#play').on(CLICK, function() {
                if (!$('#kl_vid').hasClass('hidden')) {
                    $stopwatch.stopwatch('toggle');
                    if (mobileOS !== 'iOS') {
                        var isPaused = $('#kl_vid')[0].paused;
                        // log(isPaused);
                        if (isPaused) {
                            $kl_vid.play();
                            // loaded();
                            $('#play').find('i').toggleClass('ahem');
                            // videointerval = setInterval(function() {
                            //     // cDisplay.text(counter.toFixed(1));
                            //     // counter = counter + 0.1;
                                
                            // },100);
                            // tick.start(parseFloat($('.ms span').text()));
                        } else {
                            $kl_vid.pause();
                            $('#play').find('i').toggleClass('ahem');
                            // clearInterval(videointerval);
                            tick.stop();
                        }
                    }
                }
            }).one(CLICK, function() {

                if (mobileOS === 'iOS') {
                    $stopwatch.stopwatch('stop');
                    $kl_vid.addEventListener('progress', iOSVideoUpdate, false);
                    $kl_vid.play();
                    $kl_vid.pause();
                    $('#videoblock').fadeIn();
                } else {
                    // log('event handlers instantiated');
                    // $(document.body).on('keyup.camera',function(e) {
                    //     // console.log(e.keyCode);
                    //     if((e.keyCode > 48 && e.keyCode < 55) || (e.keyCode === 48) || (e.keyCode === 75) || (e.keyCode === 76)) {
                    //         $nav.find('[data-keycode='+e.keyCode+']').click();
                    //         console.log('486. keyCode: '+e.keyCode);
                    //     }
                    // });
                }
            });

            // Social buttons
            $('#cbar-social').on(CLICK, 'li', function(event) {
                event.preventDefault();
            });

            // Replay button
            $('#replay').on(CLICK, function() {
                // reset UI
                $('#videoshare, #vidshareh2, .vidsharebtn, #vidsharebtns').fadeOut();
                $navli.addClass('visuallyhidden');
                $nav.removeAttr('class');
                $stopwatch.text('0:00');
                $stopwatch.stopwatch('destroy');
                $stopwatch.stopwatch({startTime:0}).stopwatch('start');
                $('#videoshare').fadeOut();
                // $('#cbar-social').find('li').fadeTo(250, 1);
                $(document.body).removeClass('videoEnded');

                // reset timer
                counter = 0;

                // video to start and play
                $kl_vid.currentTime = 0;
                $kl_vid.play();

                // replace keyboard events
                // $(document.body).on('keyup.camera',function(e) {
                //     if((e.keyCode > 48 && e.keyCode < 55) || (e.keyCode === 48) || (e.keyCode === 75) || (e.keyCode === 76)) {
                //         $nav.find('[data-keycode='+e.keyCode+']').click();
                //         console.log('521. keyCode: '+e.keyCode);
                //     }
                // });
            });

            // Replay Jump button
            $('#replayjump').on(CLICK, function() {
                // reset UI
                $('#videoshare, #vidshareh2, .vidsharebtn, #vidsharebtns').fadeOut();
                $navli.addClass('visuallyhidden');
                $nav.removeAttr('class');
                // $stopwatch.text('0:00');
                $stopwatch.stopwatch('destroy');
                $stopwatch.stopwatch({startTime: ((introend-5)*1000)}).stopwatch('start');
                $('#videoshare').fadeOut();
                // $('#cbar-social').find('li').fadeTo(250, 1);
                $(document.body).removeClass('videoEnded');

                // reset timer
                counter = 0;

                $('.videocontainer').fadeTo('fast',0.5, function() {
                    // video to start and play
                    $kl_vid.currentTime = introend - 5;
                    $kl_vid.play();
                    $('.videocontainer').fadeTo('fast',1);
                });

                // replace keyboard events
                // $(document.body).on('keyup.camera',function(e) {
                //     if((e.keyCode > 48 && e.keyCode < 55) || (e.keyCode === 48) || (e.keyCode === 75) || (e.keyCode === 76)) {
                //         $nav.find('[data-keycode='+e.keyCode+']').click();
                //         console.log('553. keyCode: '+e.keyCode);
                //     }
                // });
                
            });

            /************************
            * VIDEO THUMBNAILS
            * This is fairly ugly, but due to the way each browser handles <video> differently, plus all of the DOM elements required
            * for the interactive video that need to be shown/hidden it's necessary for this section to be full of hacks.
            ************************/
            
            $('#vidt-thehunt').on(CLICK, function() {
                if (!$('#kl_making')[0].paused) {
                    if ($('html').hasClass('lt-ie9')) {
                        videojs('kl_making').pause();
                        videojs('kl_vid').play();
                    } else {
                        $('#kl_making')[0].pause();
                    }
                }
                $('#kl_vid, .scrubcontainer, .controlbar button, #stopwatch').removeClass('hidden');
                $('#kl_making').addClass('hidden');
                if (!$(document.body).hasClass('huntloaded')) {
                    $('#videoblock').removeClass('hidden');
                } else {
                    if (!fallbackmode) {
                        $('#play').click();
                    } else if ($('html').hasClass('lt-ie9')) {
                        
                        videojs('kl_making').pause();
                    }
                }


                $('#kl_making').addClass('hidden');
                $(this).find('img').addClass('active');
                $('#vidt-makingof').find('img').removeClass('active');
                $('.unsupported').remove();
                return false;
            });
            
            $('#vidt-makingof').on(CLICK, function() {
                if (!$kl_vid.paused) {
                    $('#play').click();
                }
                $(document.body).removeClass('videoEnded');
                if ($('.videosharecontainer').is(':visible')) {
                    $('#videoshare, #vidshareh2, #replay, .vidsharebtn').fadeOut();
                }
                $('#kl_vid, .scrubcontainer, .controlbar button, #videoblock, #stopwatch').addClass('hidden');
                $('#kl_making').removeClass('hidden');
                if (!fallbackmode) {
                    $('#kl_making')[0].play();
                } else if ($('html').hasClass('lt-ie9')) {
                    videojs('kl_making').play();
                    videojs('kl_vid').pause();
                }
                $(this).find('img').addClass('active');
                $('#vidt-thehunt').find('img').removeClass('active');
                $('.unsupported').remove();
                return false;
            });

            setInterval(function() {
                $scrubber.attr('value',(($kl_vid.currentTime/introend)*100));
            },100);

            /************************
            * MUTE TOGGLE CONTROL
            ************************/

            $vol.on(CLICK, function() {
                $kl_vid.volume = $(this).hasClass('loudnoises') ? 0 : 1;
                $(this).toggleClass('loudnoises').find('i').toggleClass('ahem');
            });


            /************************
            * FULL-SCREEN VIDEO
            * Uses screenfull.js
            * https://github.com/sindresorhus/screenfull.js
            ************************/

            if (screenfull.enabled) {
                document.addEventListener(screenfull.raw.fullscreenchange, function () {
                    $(document.body).toggleClass('fstoggle');
                    $fsb.find('i').toggleClass('ahem');
                });
            }

            $fsb.on(CLICK, function() {
                if (screenfull.enabled) {
                    screenfull.toggle(elem);
                } else {
                    $(document.body).toggleClass('iefullscreen');
                }
            });

        }

    };

    return self;
} (this, this.document));
