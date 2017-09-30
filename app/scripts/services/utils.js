const utilsService = function($rootScope,$state,$timeout,dataService) {
  const service = {
    debounce: function(func, wait, immediate) {
      let timeout;
      return function() {
        let context = this, args = arguments;
        let later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    throttle: function(fn, threshhold, scope) {
      threshhold || (threshhold = 250);
      var last,
        deferTimer;
      return function () {
        var context = scope || this;
    
        var now = +new Date,
          args = arguments;
        if (last && now < last + threshhold) {
          // hold on to it
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    }
  };
  
  return service;
};

utilsService.$inject = ['$rootScope','$timeout'];

export default utilsService;
