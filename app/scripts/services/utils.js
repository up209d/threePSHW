const utilsService = function($rootScope,$state,$http,$timeout,$q,$sce) {
  const service = {
    mobileDetect: MobileDetect ? new MobileDetect(window.navigator.userAgent) : null,
    uniqueKey: function() {
      return Math.random().toString(36).substr(2, 9);
    },
    // Debounce Function
    debounce: function(func, wait, immediate) {
      let timeout;
      // Create a deferred object that will be resolved when we need to
      // actually call the func
      let deferred = $q.defer();
      return function() {
        let context = this, args = arguments;
        let later = function() {
          timeout = null;
          if(!immediate) {
            deferred.resolve(func.apply(context, args));
            deferred = $q.defer();
          }
        };
        let callNow = immediate && !timeout;
        if ( timeout ) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          deferred.resolve(func.apply(context,args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    },

    // Throttle Function
    throttle: function(fn, threshhold, reFire ,scope) {
      threshhold || (threshhold = 250);
      reFire || (reFire = false);
      let last,deferTimer;
      let deferred = $q.defer();
      return function () {
        let context = scope || this;
        let now = +new Date,
          args = arguments;
        if (last && now < last + threshhold) {
          // hold on to it
          $timeout.cancel(deferTimer);
          if (reFire) {
            // Run func after waiting time done
            deferTimer = $timeout(function () {
              last = now;
              deferred.resolve(fn.apply(context, args));
              deferred = $q.defer();
            },threshhold);
          }
        } else {
          last = now;
          deferred.resolve(fn.apply(context, args));
          deferred = $q.defer();
        }
        return deferred.promise;
      };
    },

    // Map a number from a range to other range
    mapRange: function(value, from, to, newFrom, newTo) {
      if (to === from) {
        return to;
      } else {
        return (((value - from) / (to - from)) * (newTo - newFrom)) + newFrom;
      }
    },

    // Avoid orphan word of paragraph by add non break space
    avoidOrphanWord: function(str = '',count=2) {
      if (str !== '') {
        let pattern = /\s/gi;
        let result = str.split(pattern).reverse();
        for (let i=0;i<count-1;i++) {
          result[1] = result[1] + '&nbsp;' + result[0];
          result.shift();
        }
        return result.reverse().join(' ');
      }
      return str;
    },

    // Generate random unique id
    uniqueKey: function() {
      return Math.random().toString(36).substr(2, 9);
    },

    // Trigger an event
    trigger: function(el,eventType) {
      if (eventType) {
        if (service.isIE()) {
          let e = document.createEvent('Event');
          e.initEvent(eventType, true, true);
          if (el) {
            $timeout(function(){
              el.dispatchEvent(e);
            });
          }
        } else {
          let e = new Event(eventType);
          if (el) {
            $timeout(function(){
              el.dispatchEvent(e,true,true);
            });
          }
        }
      }
      return true;
    },

    // Test if a variable is not undefined
    isSet: function(e) {
      if (typeof e === 'undefined') {
        return false;
      } else {
        return true;
      }
    },

    // Check browser
    isIE: function() {
      let isIE = !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
      return isIE;
    },

    // Check browser
    isSafari: function() {
      let isSafari = !!navigator.userAgent.match(/safari/gi) || !!navigator.userAgent.match(/safari/gi);
      let isChrome = !!navigator.userAgent.match(/chrome/gi) || !!navigator.userAgent.match(/chrome/gi);
      return isSafari && !isChrome;
    },

    // Check browser
    isChrome: function() {
      let isChrome = !!navigator.userAgent.match(/chrome/gi) || !!navigator.userAgent.match(/chrome/gi);
      return isChrome;
    },

    // Check browser
    isFireFox: function() {
      let isFireFox = !!navigator.userAgent.match(/firefox/gi) || !!navigator.userAgent.match(/firefox/gi);
      return isFireFox;
    },

    // Check Handheld
    isHandheld: function() {
      let browserDetection = new MobileDetect(window.navigator.userAgent);
      if (browserDetection.mobile() || browserDetection.phone() || browserDetection.tablet()) {
        return true;
      } else {
        return false;
      }
    },

    // Parse SVG Content to HTML
    // This Function purpose is create an object which also a ref to the $rootScope
    // So everytime $rootScope change, it will change also
    // By doing that, we solve the async problem from $http.get which is the hard to
    // parse the result once the request is done
    getSVGImage: function(link) {
      let self = this;
      // Init Images Cache In utilsService
      if (!self.imagesCache) {
        self.imagesCache = []
      }

      // Return Image if image is found in cache
      // So if we do preloading on routing to preload this,
      // This will be come synchoronous function otherwise
      let currentIndex = self.imagesCache.findIndex(function(item){
        return item.path === link;
      });

      if (currentIndex !== -1) {
        return self.imagesCache[currentIndex].data;
      }

      // Add New Image to Image Cache if it wasnt found
      // It retain synchronously by assign a preloading element immediately
      // Then when it has data, it will return an svg take place of that preload element
      currentIndex = self.imagesCache.length || 0;

      // Default Value
      self.imagesCache.push({
        path: link,
        data: $sce.trustAsHtml('<span class="dl-pre-loading"></span>')
      });

      $http({
        method: 'GET',
        cache: true,
        url: link
      }).then(function(res) {
        self.imagesCache[currentIndex] = {
          path: link,
          data: $sce.trustAsHtml(res.data)
        };
      });
      return self.imagesCache[currentIndex].data;
    }
  };

  return service;
};

utilsService.$inject = ['$rootScope','$state','$http','$timeout','$q','$sce'];

export default utilsService;
