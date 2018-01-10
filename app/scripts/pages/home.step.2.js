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

    // Lights
    self.lights = [];

    self.lights[0] = new THREE.DirectionalLight('#00FF00', 1);
    self.lights[0].position.set(-1,1,1);
    self.scene.add(self.lights[0]);

    self.lights[1] = new THREE.DirectionalLight('#ff0000', 1);
    self.lights[1].position.set(1,1,1);
    self.scene.add(self.lights[1]);

    self.lights[2] = new THREE.PointLight('#0000ff', 1);
    self.lights[2].position.set(0,0,0);
    self.scene.add(self.lights[2]);

    // Meshes

    let createCubes = function(options) {
      if (typeof options === 'undefined') {
        options = {}
      }

      options = Object.assign({
        gridSize: 100,
        gridLength: 30,
        gridPadding: 1,
        delta: new THREE.Vector3(0,600,0),
        duration: 15.0,
        totalDelay: 5.0
      },options);

      let cubeSize = options.gridSize / options.gridLength;
      let cubeCount = Math.pow(options.gridLength,3);

      let prefab = new THREE.PlaneGeometry(
        cubeSize-options.gridPadding,
        cubeSize-options.gridPadding,
        1//cubeSize-options.gridPadding
      );

      let tempGeometry = new THREE.BoxBufferGeometry(
        cubeSize-options.gridPadding,
        cubeSize-options.gridPadding,
        cubeSize-options.gridPadding
      );

      let geometry = new THREE.BAS.PrefabBufferGeometry(prefab,cubeCount);

      console.log(tempGeometry);
      console.log(geometry);

      let startPositionBuffer = geometry.createAttribute('startPosition',3);
      let endPositionBuffer = geometry.createAttribute('endPosition',3);
      let rotationBuffer = geometry.createAttribute('rotation',4);
      let durationBuffer = geometry.createAttribute('duration',1);
      let startTimeBuffer = geometry.createAttribute('startTime',1);
      let cubeIndexBuffer = geometry.createAttribute('cubeIndex',1);

      let cubeIndex = 0;

      // Just save memory by re-use this memory block
      // instead of create a new memory address by local variable
      let tmpa = [];

      for (let x = 0; x < options.gridLength ; x++) {
        for (let y = 0; y < options.gridLength ; y++) {
          for (let z = 0; z < options.gridLength ; z++) {

            // Start Position
            tmpa[0] = THREE.Math.mapLinear(x,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) + options.delta.x;
            tmpa[1] = THREE.Math.mapLinear(y,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) + options.delta.y;
            tmpa[2] = THREE.Math.mapLinear(z,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) + options.delta.z;
            geometry.setPrefabData(startPositionBuffer, cubeIndex, [tmpa[0],tmpa[1],tmpa[2]]);

            // End Position
            tmpa[0] = THREE.Math.mapLinear(x,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) - options.delta.x;
            tmpa[1] = THREE.Math.mapLinear(y,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) - options.delta.y;
            tmpa[2] = THREE.Math.mapLinear(z,0,options.gridLength-1,-options.gridSize/2,options.gridSize/2) - options.delta.z;
            geometry.setPrefabData(endPositionBuffer, cubeIndex, [tmpa[0],tmpa[1],tmpa[2]]);

            // Rotation
            tmpa[0] = Math.random()*2-1;
            tmpa[1] = Math.random()*2-1;
            tmpa[2] = Math.random()*2-1;
            tmpa[3] = Math.PI * 2;
            geometry.setPrefabData(rotationBuffer, cubeIndex, [tmpa[0],tmpa[1],tmpa[2],tmpa[3]]);



            tmpa[4] = options.duration;
            geometry.setPrefabData(durationBuffer, cubeIndex, [tmpa[4]]);

            tmpa[5] = (options.totalDelay / cubeCount) * cubeIndex * Math.random() * options.totalDelay;
            geometry.setPrefabData(startTimeBuffer, cubeIndex, [tmpa[5]]);

            tmpa[6] = cubeIndex;
            geometry.setPrefabData(cubeIndexBuffer, cubeIndex, [tmpa[6]]);

            cubeIndex++;
          }
        }
      }

      let material = new THREE.BAS.PhongAnimationMaterial({
        flatShading: THREE.FlatShading,
        wireframe: true,
        uniforms: {
          time: {
            value: 0
          }
        },
        // DONT FORGET SEMI-COLON
        // Assign values, assign functions here
        vertexFunctions: [
          `
            float rand(float n){return fract(sin(n) * 43758.5453123);}
            
            float noise(float p){
              float fl = floor(p);
              float fc = fract(p);
              return mix(rand(fl), rand(fl + 1.0), fc);
            }
            
            vec3 cubicBezier(vec3 p0, vec3 c0, vec3 p1, vec3 c1, float t) {   
              float tn = 1.0 - t;
              return 
                tn * tn * tn * p0 + 
                3.0 * tn * tn * t * c0 + 
                3.0 * tn * t * t * c1 + 
                t * t * t * p1;
            }
            
            vec3 sample(vec3 startPosition,vec3 endPosition,float progress, float radius) {
              vec3 position;
              float angle = progress * PI/2.0;
              float randomFactor = (1.0-rand(angle+cubeIndex))*sin(angle)*cos(angle)*radius*100.0;
              position.x = startPosition.x + radius*sin(angle*20.0);
              position.y = startPosition.y*cos(angle) + endPosition.y*sin(angle);
              position.z = startPosition.z + radius*sin(angle*24.0);
              return position;
            }
            
          `,
          THREE.BAS.ShaderChunk['ease_sine_in_out'],
          THREE.BAS.ShaderChunk['quaternion_rotation']
        ],
        vertexParameters: [
          'uniform float time;',
          'attribute vec3 startPosition;',
          'attribute vec3 endPosition;',
          'attribute vec4 rotation;',
          'attribute float startTime;',
          'attribute float duration;',
          'attribute float cubeIndex;'
        ],
        vertexPosition: [
          'float random = rand(time);',
          'float progress = (clamp(time - startTime, 0.0, duration) / duration);',
          'float noiseFactor = noise(cubeIndex+time)/2.0;',

          // Easing for progress
          'progress = easeSineInOut(progress);',

          // Scale should be calculated before positioning
          'float scaleFactor = 1.0 + (sin(progress * PI)*noiseFactor);',
          'transformed *= scaleFactor;',

          // Rotation should be calculated before positioning
          'vec4 quaternion = quatFromAxisAngle(rotation.xyz,rotation.w * progress + rotation.w*noiseFactor);',
          'transformed = rotateVector(quaternion, transformed);',

          // Positioning
          // 'vec3 _endPosition = endPosition + vec3(0,0,0);',
          // Linear Positioning
          // 'transformed += mix(startPosition,endPosition,progress);'
          // Cubic Bezier Positioning
          // 'transformed += cubicBezier(startPosition,startPosition+vec3(0,200,0),endPosition,endPosition+vec3(0,-200,0),progress);'
          // Custom Function Positioning
          'transformed += sample(startPosition,endPosition,progress,cubeIndex/10.0);',
        ],
        fragmentParameters: [

        ],
        fragmentSpecular: [

        ]
      });

      self.cubes = new THREE.Mesh(geometry, material);
      self.scene.add(self.cubes);
    };

    createCubes();

    console.log(self.cubes);

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
    self.cubes.material.uniforms.time.value += 0.06;
    self.cubes.material.uniforms.time.value %= 30;

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
