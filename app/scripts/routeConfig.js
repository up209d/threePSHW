// Page List
const routeConfig = function ($stateProvider, $urlRouterProvider, $locationProvider) {

  const routes = [
    {
      name: 'root',
      abstract: true,
      resolve: {
        // In order to get transition work in the beginning, the rendering of root state should be async
        // and solved by a resolve promise such as font loader, data loader, image cache loade etc ...
        rootMsg: function() {
          return 'Root / '
        },
        preloadFont: function(preloadService) {
          return preloadService.fonts(['Roboto:300,400,700']);
        },
      },
      data: {
        page: 'root'
      },
      onEnter: function ($transition$, $state$) {
        console.log(
          '** Router Msg **: Root Entering ... \n',
          'Transition: ',$transition$,
          ' \n',
          'State: ',$state$
        );
      },
      onExit: function () {
        console.log('** Router Msg **: Root Exiting ...');
      },
      template: '<div class="animate-show-hide animation fade-in-out-down-up instant-hide" ui-view></div>',
      controller: [
        '$scope','$state',
        function rootController($scope,$state){
          $scope.state = $state;
        }
      ]
    },
    {
      name: 'root.home',
      url: '/',
      resolve: {
        homeMsg: function () {
          return 'Home / ';
        }
      },
      data: {
        page: 'home'
      },
      onEnter: function () {
        console.log('** Router Msg **: Home Entering ...');
      },
      onExit: function () {
        console.log('** Router Msg **: Home Exiting ...');
      },
      params: {
        // Default params, optional params come here
        // If you set default param here with same param as child view
        // It shall mess up with the transition state.go, the view will exit enter everytime
      },
      views: {
        // It is better to use template and controller to put component in instead of
        // declare component directly here, since you will have an inherit resolve, data
        // and can bind data in to the component, you also have one parent controller bound to
        // the template in addition. Also you can control your template better
        // than just declare only component here
        '': {
          // template: '<h1 class="text-center p-5">HELLO WORLD</h1>',
          // controller: ['$scope',function($scope) {
          //  // Do Smt
          // }]
          // In case you want to bind something to component
          // The binding has to be a resolve function name in string as UI Router for AngularJs limitation
          component: 'dlHome',
          // bindings: {
          //  rootMsg: 'rootMsg',
          //  homeMsg: 'homeMsg'
          // }
        }
      }
    }
  ];

  $urlRouterProvider.otherwise('/');

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
