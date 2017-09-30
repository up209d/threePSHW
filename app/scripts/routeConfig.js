// Page List
const routeConfig = function ($stateProvider, $urlRouterProvider, $locationProvider) {
  
  const routes = [
    {
      name: 'home',
      url: '',
      resolve: {
        msg: function () {
          return 'Home / ';
        }
      },
      data: {
        page: 'home'
      },
      onEnter: function ($transition$, $state$) {
        // console.log(
        //   'Home Entering ...',
        //   $transition$,$state$
        // );
      },
      onExit: function () {
        // console.log('Home Exiting ...');
      },
      params: {
      
      },
      views: {
        // It is better to use template and controller to put component in instead of
        // declare component directly here, since you will have a inheirt resolve, data
        //  and can bind data in to the component, you also have one parent controller bound to
        // the template in addition. Also you can control your template better
        // than just declare only component here
        '': {
          template: '<h1 class="text-center p-5">HELLO WORLD</h1>',
          // In case you want to bind something to component
          // component: 'dlHome',
          // bindings: {}
        }
      }
    }
  ];
  
  $urlRouterProvider.otherwise('');
  
  routes.forEach((route) => {
    $stateProvider.state(route);
  });
  
  // HTML5 Mode to remove # prefix, it depend on the config of the server that
  // all the url request in any case has to be served as the root / as a fallback
  $locationProvider
    .html5Mode(
      {
        enabled: false,
        requireBase: false
      })
    // Fallback to prefix '#' if browser doesnt support HTML5Mode
    // for exp if add '!' in so it will become '!#'
    .hashPrefix('')
  
};

routeConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default routeConfig;
