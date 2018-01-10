import templates from './home.template'

export default {
  template: function() {
    return templates[0];
  },
  bindings: {

  },
  controller: [
    '$scope','$timeout','$element',
    dlHomeController
  ]
}

function dlHomeController($scope,$timeout,$element) {
  let self = this;

  window._three = self;
  THREE.BAS = BAS;

  self.isInited = false;
  self.isPostLinked = false;
  self.animationHandler = null;

  self.$onInit = function() {
    // Init default value
    self.isInited = true;
    self.state = {
      resolution: window.devicePixelRatio,
      fps: 60, // Our Desire Framerate // How many 'updates' per 1 real second
      step: 1/60,
      frame: 0,
      currentTime: new Date().getTime(),
      lastTime: new Date().getTime(),
      totalTime: 0,
    }

  };

  self.$postLink = function() {
    // DOM is ready, create instance attached to Canvas DOM element
    self.canvas = $element[0].querySelector('canvas');

    self.isPostLinked = true;

    self.stats = new Stats();
    self.stats.showPanel(0);
    document.body.appendChild(self.stats.dom);

    // Canvas Renderer

    self.renderer = new THREE.WebGLRenderer({
      canvas: $element[0].querySelector('canvas'),
      antialias: true,
      alpha: true
    });

    self.renderer.setClearColor('#FFFFFF',1);

    self.renderer.setSize(self.canvas.clientWidth,self.canvas.clientHeight);

    self.camera = new THREE.PerspectiveCamera(45, self.canvas.clientWidth/self.canvas.clientHeight, 1 , 10000);

    self.scene =  new THREE.Scene();
    self.controls = new THREE.OrbitControls(self.camera);


    // Meshes



    self.camera.position.set(0,0,2000);
    self.controls.update();
    self.runTimeStepFixed();

    window.addEventListener('resize',self.resize);
  };

  self.$onChange = function(changes) {
    if (self.isInited) {
      // Scope, Data Bindings, Controller is ready
      // Do Smt
      if (self.isPostLinked) {
        // DOM is ready bound
        // Do Smt
      }
    }
  };

  self.$onDestroy = function() {
    // Un-mount component do smt
    window.removeEventListener('resize',self.resize);
  };

  // Update data of the scene
  self.update = function() {
    // Update Stats
    self.stats.begin();
    // Monitor here
    self.stats.end();

    // Update Camera
    self.camera.updateProjectionMatrix();
    self.camera.updateMatrixWorld();
    self.camera.matrixWorldInverse.getInverse(self.camera.matrixWorld);

    // Update Mesh


    // Update Control
    self.controls.update();
  };

  self.resize = function() {
    console.log('Window Resized: ',window.innerWidth,' x ',window.innerHeight);
    self.camera.aspect = window.innerWidth/window.innerHeight;
    self.renderer.setSize(window.innerWidth,window.innerHeight);
  };

  // Render the scene
  self.render = function() {
    // Update Renderer
    self.renderer.render(self.scene,self.camera);
  };

  self.renderChild = function() {
    // Render each child of scene
  };

  // Function that control the sync between update() and render()
  self.runTimeStepFixed = function() {
    self.state.currentTime = new Date().getTime();
    let deltaTime = self.state.currentTime - self.state.lastTime;
    deltaTime = deltaTime > 1000 ? 1000 : deltaTime; // Maximum delta is 1000 ms
    self.state.totalTime += deltaTime;

    while (self.state.totalTime > self.state.step*1000) {
      self.state.totalTime -= self.state.step*1000;
      self.update(self.state.step);
    }

    self.state.lastTime = self.state.currentTime;
    self.render();
    self.animationHandler = requestAnimationFrame(self.runTimeStepFixed);
  };
}
