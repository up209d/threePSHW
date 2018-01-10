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
    self.element = $element[0].querySelector('canvas');

    self.isPostLinked = true;

    self.stats = new Stats();
    self.stats.showPanel(0);
    document.body.appendChild(self.stats.dom);

    // Canvas Renderer
    // self.renderer = new THREE.WebGLRenderer({
    //   canvas: $element[0].querySelector('canvas'),
    //   antialias: true,
    //   alpha: true
    // });

    // We will do the render by ourselves
    self.renderer = new Renderer(self.element);
    self.renderer.setSize(self.element.clientWidth,self.element.clientHeight);

    self.camera = new THREE.PerspectiveCamera(45, self.element.clientWidth/self.element.clientHeight, 1 , 10000);
    self.camera.z = 0;

    self.scene =  new THREE.Scene();
    self.controls = new THREE.OrbitControls(self.camera);

    // Mesh
    self.mesh = {
      geometry: {
        vertices: [
          // Top-Left 0
          { position: new THREE.Vector3(-100,50,0) },
          // Top-right 1
          { position: new THREE.Vector3(100,50,0) },
          // Bottom-right 2
          { position: new THREE.Vector3(100,-50,0) },
          // Bottom-left: 3
          { position: new THREE.Vector3(-100,-50,0) }
        ],
        // Indices is just one dimension array with weight of 3 (take 3 children at once)
        indices: [
          // 1st Face
          0,1,3,
          // 2nd Face
          1,2,3
        ]
      },
      material: {
        color: '#ff0000', // Red
        wireframe: true,
        // Basic vertexShader
        vertexShader: function() {
          // this function doesnt have argument but actually it has this context
          // When we call this function we have to apply(context) to this
          // the context look like this:
          // {
          //   attributes: {
          //     position: vertex.position.clone()
          //   },
          //   uniforms: uniforms
          // }
          let position = this.attributes.position;
          let modelViewMatrix = this.uniforms.modelViewMatrix;
          let projectionMatrix = this.uniforms.projectionMatrix;
          let modelViewProjectionMatrix = new THREE.Matrix4().multiplyMatrices(
            projectionMatrix,
            modelViewMatrix
          );
          // gl_Position = position * modelViewProjectionMatrix;
          return position.applyMatrix4(modelViewProjectionMatrix);
        },
        // Basic Material
        fragmentShader: function() {
          // This function same with vertextShader function above
          // gl_FragColor = color;
          return this.uniforms.color;
        }
      },
      position: new THREE.Vector3(0,0,0),
      rotation: new THREE.Euler  (0,0,0),
      scale:    new THREE.Vector3(1.0,1.0,1.0)
    };

    // Push to scene
    self.scene.children.push(self.mesh);



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

    // Rotate Our Mesh
    self.mesh.rotation.y += 0.01;

    // Update Control
    self.controls.update();
  };

  self.resize = function() {
    self.camera.aspect = self.element.innerWidth/self.element.innerHeight;
    self.renderer.setSize(self.element.innerWidth,self.element.innerHeight);
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


function Renderer(el) {
  this.id = Math.random().toString(16).substring(2,7);
  this.el = el;
  this.clearColor = '#ffffff';
  this.ctx = el.getContext('2d');
  console.log('Canvas Renderer ID: ', this.id);
}

Renderer.prototype = {
  render: function(scene,camera) {
    let self = this;

    self.ctx.fillStyle = self.clearColor;
    // From Bottom Left (-1,-1) with width,height of (2,2)
    self.ctx.fillRect(-1, -1, 2, 2);

    // self.ctx.fillStyle = '#ff0000';
    // self.ctx.fillRect(-0.1,-0.1,0.2,0.2);

    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    scene.children.forEach(function(child){
      self.renderChild(child,camera)
    });
  },
  renderChild: function(child, camera) {
    let matrixWorld = new THREE.Matrix4();
    let quaternion = new THREE.Quaternion().setFromEuler(child.rotation);

    matrixWorld.compose(child.position, quaternion, child.scale);

    // console.log(matrixWorld.compose(child.position, quaternion, child.scale));

    let modelViewMatrix = new THREE.Matrix4().multiplyMatrices(
      camera.matrixWorldInverse,
      matrixWorld
    );

    let uniforms = {
      modelViewMatrix: modelViewMatrix,
      projectionMatrix: camera.projectionMatrix,
      color: child.material.color
    };

    // Render the Mesh
    let vertices = child.geometry.vertices;
    let indices = child.geometry.indices;
    let indexCount = indices.length;
    let faceCount = indexCount/3;

    for (let i = 0; i < faceCount; i++) {
      let vertex0Index = indices[i*3+0];
      let vertex1Index = indices[i*3+1];
      let vertex2Index = indices[i*3+2];

      let vertex0 = vertices[vertex0Index];
      let vertex1 = vertices[vertex1Index];
      let vertex2 = vertices[vertex2Index];

      let p0 = this.applyVertexShader(child.material.vertexShader, uniforms, vertex0);
      let p1 = this.applyVertexShader(child.material.vertexShader, uniforms, vertex1);
      let p2 = this.applyVertexShader(child.material.vertexShader, uniforms, vertex2);

      // Draw
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.lineTo(p0.x,p0.y);
      this.ctx.lineTo(p1.x,p1.y);
      this.ctx.lineTo(p2.x,p2.y);
      this.ctx.closePath();

      if (child.material.wireframe) {
        this.ctx.strokeStyle = this.applyFragmentShader(child.material.fragmentShader, uniforms);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = this.applyFragmentShader(child.material.fragmentShader, uniforms);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  },
  applyVertexShader: function(shader,uniforms,vertex) {
    let context = {
      attributes: {
        position: vertex.position.clone()
      },
      uniforms: uniforms
    };
    return shader.apply(context);
  },
  applyFragmentShader: function(shader,uniforms) {
    let context = {
      uniforms: uniforms
    };
    return shader.apply(context);
  },
  setSize: function() {
    // Apply width and height.
    this.width = this.el.width = this.el.clientWidth;
    this.height = this.el.height = this.el.clientHeight;

    // Since the fragment shader outputs its values in Normalized Device Coordinates (ranging from -1 to 1 on both axes),
    // we will transform the canvas context to match this coordinate system.
    this.ctx.save();
    // center
    this.ctx.translate(this.width * 0.5, this.height * 0.5);

    // scale (and invert y to match NDC)
    // this is the main function to normalize coordinate system
    this.ctx.scale(this.width, -this.height);
    // descrease the line width to match the new dimensions.
    this.ctx.lineWidth = 1 / (Math.max(this.width, this.height));
    // so now all our coordinate system will be (-1,-1) to (1,1)
    // width will be from left to right
    // height will be from down to up (note that it is reversed direction)
  },
  resize: function() {
    return this.setSize;
  }
};
