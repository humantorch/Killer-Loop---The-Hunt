// PLUGINS

// getMobileOS - written by Jim Bergman - PUBLIC DOMAIN - v1.00 2012-Nov-24
var mobileOS;var mobileOSver;function getMobileOS(){var e=navigator.userAgent;var t;if(e.match(/iPad/i)||e.match(/iPhone/i)){mobileOS="iOS";t=e.indexOf("OS ")}else if(e.match(/Android/i)){mobileOS="Android";t=e.indexOf("Android ")}else{mobileOS="unknown"}if(mobileOS==="iOS"&&t>-1){mobileOSver=e.substr(t+3,3).replace("_",".")}else if(mobileOS==="Android"&&t>-1){mobileOSver=e.substr(t+8,3)}else{mobileOSver="unknown"}};
getMobileOS();




var BrowserDetect = BrowserDetect || {};

BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) ||       this.searchVersion(navigator.appVersion) || "Unknown";
    },

    searchString: function(data) {
        for (var i=0 ; i < data.length ; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) != -1) {
                return data[i].identity;
            }
        }
    },

    searchVersion: function(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
    },

    dataBrowser: [
        { string: navigator.userAgent, subString: "Chrome",  identity: "Chrome" },
        { string: navigator.userAgent, subString: "MSIE",    identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Safari",  identity: "Safari" },
        { string: navigator.userAgent, subString: "Opera",   identity: "Opera" }
    ]

};
BrowserDetect.init();


/**
* Tock by Mr Chimp - github.com/mrchimp/tock
* Based on code by James Edwards:
*    sitepoint.com/creating-accurate-timers-in-javascript/
*/
var Tock = (function(options) {
  var go = false,
      interval = options.interval || 10,
      countdown = options.countdown || false,
      final_time = 0,
      callback = options.callback,
      complete = options.complete;

  /**
   * Reset the clock
   */
  function reset() {
    if (countdown) {
      return false;
    }
    stop();
    start_time = 0;
    time = 0;
    elapsed = '0.0';
  }

  /**
   * Start the clock.
   */
  function start(time) {
    if (countdown) {
      _startCountdown(time);
    } else {
      _startTimer(time);
      console.log(time);
    }
  }
  
  /**
   * Called every tick for countdown clocks.
   * i.e. once every this.interval ms
   */
  function _tick() {
    time += interval;
    elapsed = Math.floor(time / interval) / 10;

    if (Math.round(elapsed) === elapsed) { elapsed += '.0'; }

    var t = this,
        diff = (Date.now() - start_time) - time,
        next_interval_in = interval - diff;

    if (callback !== undefined) {
      callback(this);
    }

    if (countdown && (duration_ms - time < 0)) {
      final_time = 0;
      go = false;
      complete();
    }

    if (next_interval_in <= 0) {
      missed_ticks = Math.floor(Math.abs(next_interval_in) / interval)
      time += missed_ticks * interval
      if (go) {
        _tick();
      }
    } else {
      if (go) {
        timeout = window.setTimeout(_tick, next_interval_in);
      }
    }
  }

  /**
   * Stop the clock.
   */
  function stop() {
    go = false;
    // final_time = (Date.now() - start_time);
    // window.clearTimeout(timeout);
  }
  
  /**
   * Get the current clock time in ms.
   * Use with Tock.msToTime() to make it look nice.
   */
  function lap() {
    if (go) {
      var now;

      if (countdown) {
        now = duration_ms - (Date.now() - start_time);
      } else {
        now = (Date.now() - start_time);
      }

      return now;
    }

    return final_time;
  }
  
  /**
   * Format milliseconds as a string.
   */
  function msToTime(ms) {
    if (ms <= 0) {
      return "00:00.000";
    }

    var milliseconds = (ms % 1000).toString(),
        seconds = Math.floor((ms / 1000) % 60).toString(),
        minutes = Math.floor((ms / (60 * 1000)) % 60).toString();

    if (milliseconds.length === 1) {
      milliseconds = '00' + milliseconds;
    } else if (milliseconds.length === 2) {
      milliseconds = '0' + milliseconds;
    }
    if (seconds.length === 1) {
      seconds = '0' + seconds;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }
    return minutes + ":" + seconds + "." + milliseconds;
  }
  
  /**
   * Convert a time string to milliseconds
   * Todo: handle this a bit better
   *
   * Possible inputs:
   * MM:SS
   * MM:SS:ms
   * yyyy-mm-dd HH:MM:SS.ms
   */
  function timeToMS(time) {
    var ms = new Date(time).getTime();

    if (!ms) {
      var time_split = time.split(':'),
          ms;

      ms = parseInt(time_split[0], 10) * 60000;

      if (time_split.length > 1) {
        ms += parseInt(time_split[1], 10) * 1000;
      }

      if (time_split.length > 2) {
        ms += parseInt(time_split[2], 10);
      }
    }

    return ms;
  }

  /**
   * Called by Tock internally - use start() instead
   */
  function _startCountdown(duration) {
    duration_ms = duration;
    start_time = Date.now();
    end_time = this.start_time + this.duration;
    time = 0;
    elapsed = '0.0';
    go = true;
    var t = this;
    this.timeout = window.setTimeout(_tick, 100);
  };

  /**
   * Called by Tock internally - use start() instead
   */
  function _startTimer(starttime) {
    if (!starttime) {
        starttime = 0;
    }
    start_time = Date.now();
    time = starttime;
    elapsed = starttime.toString();
    go = true;
    var t = this;
    this.timeout = window.setTimeout(_tick, 100);
  }
  
  return {
    start: start, 
    stop: stop,
    reset: reset,
    lap: lap,
    msToTime: msToTime,
    timeToMS: timeToMS
  };
});


/****** 
jQuery Stopwatch 
https://github.com/robcowie/jquery-stopwatch
******/

(function( $ ){

    function incrementer(ct, increment) {
        return function() { ct+=increment; return ct; };
    }
    
    function pad2(number) {
         return (number < 10 ? '0' : '') + number;
    }

    

    function defaultFormatMilliseconds(millis) {
        var x, seconds, minutes, hours;
        x = millis / 1000;
        seconds = Math.floor(x % 60);
        x /= 60;
        minutes = Math.floor(x % 60);
        x /= 60;
        hours = Math.floor(x % 24);
        // x /= 24;
        // days = Math.floor(x);
        return [minutes, pad2(seconds)].join(':');
    }

    //NOTE: This is a the 'lazy func def' pattern described at http://michaux.ca/articles/lazy-function-definition-pattern
    function formatMilliseconds(millis, data) {
        // Use jintervals if available, else default formatter
        var formatter;
        if (typeof jintervals == 'function') {
            formatter = function(millis, data){return jintervals(millis/1000, data.format);};
        } else {
            formatter = defaultFormatMilliseconds;
        }
        formatMilliseconds = function(millis, data) {
            return formatter(millis, data);
        };
        return formatMilliseconds(millis, data);
    }

    var methods = {
        
        init: function(options) {
            var defaults = {
                updateInterval: 1000,
                startTime: 0,
                format: '{MM}:{SS}',
                formatter: formatMilliseconds
            };
            
            // if (options) { $.extend(settings, options); }
            
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('stopwatch');
                
                // If the plugin hasn't been initialized yet
                if (!data) {
                    // Setup the stopwatch data
                    var settings = $.extend({}, defaults, options);
                    data = settings;
                    data.active = false;
                    data.target = $this;
                    data.elapsed = settings.startTime;
                    // create counter
                    data.incrementer = incrementer(data.startTime, data.updateInterval);
                    data.tick_function = function() {
                        var millis = data.incrementer();
                        data.elapsed = millis;
                        data.target.trigger('tick.stopwatch', [millis]);
                        data.target.stopwatch('render');
                    };
                    $this.data('stopwatch', data);
                }
                
            });
        },
        
        start: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('stopwatch');
                // Mark as active
                data.active = true;
                data.timerID = setInterval(data.tick_function, data.updateInterval);
                $this.data('stopwatch', data);
            });
        },
        
        stop: function() {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('stopwatch');
                clearInterval(data.timerID);
                data.active = false;
                $this.data('stopwatch', data);
            });
        },
        
        destroy: function() {
            return this.each(function(){
                var $this = $(this),
                    data = $this.data('stopwatch');
                $this.stopwatch('stop').unbind('.stopwatch').removeData('stopwatch');
            });
        },
        
        render: function() {
            var $this = $(this),
                data = $this.data('stopwatch');
            $this.html(data.formatter(data.elapsed, data));
        },

        getTime: function() {
            var $this = $(this),
                data = $this.data('stopwatch');
            return data.elapsed;
        },
        
        toggle: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('stopwatch');
                if (data.active) {
                    $this.stopwatch('stop');
                } else {
                    $this.stopwatch('start');
                }
            });
        },
        
        reset: function() {
            return this.each(function() {
                var $this = $(this);
                    data = $this.data('stopwatch');
                data.incrementer = incrementer(data.startTime, data.updateInterval);
                data.elapsed = data.startTime;
                $this.data('stopwatch', data);
            });
        }
    };
    
    
    // Define the function
    $.fn.stopwatch = function( method ) {
        if (methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.stopwatch' );
        }
    };

})( jQuery );