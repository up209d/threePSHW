import routeConfig from './routeConfig';

// Angular App Data Binding Controller
const myApp = angular.module('dlApp', ['ui.router','ngAnimate','hmTouchEvents']);

// Root Controller
myApp.controller('dlController',[
  '$rootScope','$scope','$timeout','utilsService',
  function($rootScope,$scope,$timeout,utilsService){
    let self = this;
    $scope.utilsService = utilsService;

    // $scope.isInited = false;
    //
    // $timeout(function(){
    //   $scope.isInited = true;
    // },1000)
    //
    // $timeout(function(){
    //   $scope.isInited = false;
    // },3000)

  }
]);

// Services List
import utilsService from './services/utils';
myApp.service('utilsService',utilsService);

import preloadService from './services/preload';
myApp.service('preloadService',preloadService);

// Components List


// Layouts


// Pages
import dlHome from './pages/home';
myApp.component('dlHome',dlHome);

// Config For Route
myApp.config(routeConfig);

myApp.run([
  '$rootScope',
  '$state',
  '$transitions',
  '$trace',
  '$timeout',
  myAppRun
]);

function myAppRun($rootScope,$state,$transitions,$trace,$timeout) {
  console.log('UP - App Started');
  //  $trace.enable('TRANSITION');

  $rootScope.transition = $transitions;

  $rootScope.stateRecords = [];

  $rootScope.transition.onCreate({},function(transition){
    // console.log('Transition Create')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });

  $rootScope.transition.onBefore({},function(transition){
    // console.log('Transition Before')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    $rootScope.rootState = {
      lastState: {
        ...transition.$from(),
        params: {
          ...$state.params
        }
      },
      nextState: {
        ...transition.$to(),
        params: {
          ...transition.params()
        }
      }
    };
    // console.log($rootScope.rootState);
  });

  $rootScope.transition.onError({},function(transition){
    // console.log('Transition Error')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });

  $rootScope.transition.onStart({},function(transition){
    // console.log('Transition Start',transition);
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    console.log('PARAMS: ',transition.params());
    console.log('STATE: ',transition.$to().name);
  });

  $rootScope.transition.onRetain({},function(transition){
    // console.log('Transition Retain')
    // console.log('Current from: ', transition.from(), ' to : ', transition.to());
  });

  $rootScope.transition.onEnter({},function(transition){
    // console.log('Transition Enter')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    // Validate URL whether all params is valid
    // return false
  });

  $rootScope.transition.onExit({},function(transition){
    // console.log('Transition Exit')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });

  $rootScope.transition.onFinish({},function(transition){
    // console.log('Transition Finish')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
  });

  $rootScope.transition.onSuccess({},function(transition){
    // console.log('Transition Success')
    // console.log('Current from: ', transition.$from(), ' to : ', transition.$to());
    $rootScope.stateRecords.push($rootScope.rootState.currentState);
  });
}

export default myApp;
