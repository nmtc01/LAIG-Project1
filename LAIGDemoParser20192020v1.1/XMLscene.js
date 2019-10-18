var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, se    tting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initDefaultCamera();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        //interface utils
        this.displayAxis = true;
        this.light0 = true;
        this.light1 = false;
        this.light2 = false;
        this.light3 = false;
        this.light4 = false;
        this.light5 = false;
        this.light6 = false;
        this.light7 = false;

        //TODO try to improve using array 
        //this.lightSwitch = [true, false, false, false, false, false, false, false];
        this.lightSwitch = [
            this.light0,
            this.light1,
            this.light2,
            this.light3,
            this.light4,
            this.light5,
            this.light6,
            this.light7
        ];
        //save index of the selected item 
        this.selectedLight = 0;
        //*I wanted to do a different way, as professor 
        this.selectedCamera = 0;

        this.keysPressed=false; 

    }

    initDefaultCamera() {
        //default camera 
        //MANIP test
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(100, 100, 100), vec3.fromValues(0, 0, 0)); //default was at 15,15,15
    }
    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        //array to store enabled cameras, got from from views
        this.cameras = {};
        this.cameraIDs = [];
        let aux = true;
        //TODO explode porque nao identifica views e nao consigo perceber porque...
        for (var key in this.graph.views) {
            if (this.graph.views.hasOwnProperty(key)) {
                var view = this.graph.views[key];
                switch (view.type) {
                    case ('perspective'):
                        {
                            var auxCam = new CGFcamera(view.angle * DEGREE_TO_RAD, view.near, view.far,
                                vec3.fromValues(...Object.values(view.from)), vec3.fromValues(...Object.values(view.to)));
                            this.cameras[view.viewId] = auxCam;
                            this.cameraIDs.push(view.viewId);
                            break;
                        }
                    case ('ortho'):
                        {
                            var auxCam = new CGFcameraOrtho(view.left, view.right, view.bottom, view.top, view.near, view.far,
                                vec3.fromValues(...Object.values(view.from)), vec3.fromValues(...Object.values(view.to)), vec3.fromValues(...Object.values(view.up)));
                            this.cameras[view.viewId] = auxCam;
                            this.cameraIDs.push(view.viewId);
                            break;
                        }
                }
                //set the first camera passed
                if (aux) {
                    console.log(view.viewId);
                    this.camera = this.cameras[view.viewId];
                    this.interface.setActiveCamera(this.cameras[view.viewId]);
                    aux = false;
                }

            }
        }

        if (this.cameras.length != 0)
            return "no cameras were defined";
    }
    //Update camera upon change on interface
    updateCameras(val) {
        this.camera = this.cameras[val];
        this.interface.setActiveCamera(this.cameras[val]);
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.
        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    //Update Lights upon change on interface
    updateLights() {

        if (this.light0) {
            this.lights[0].enable();
            //console.log('ola');
        } else {
            this.lights[0].disable();
            //console.log('xau');
        }
        this.lights[0].update();

        if (this.light1) {
            this.lights[1].enable();
            //console.log('ola');
        } else {
            this.lights[1].disable();
            //console.log('xau');
        }
        this.lights[1].update();

        if (this.light2) {
            this.lights[2].enable();
            //console.log('ola');
        } else {
            this.lights[2].disable();
            //console.log('xau');
        }
        this.lights[2].update();

        if (this.light3) {
            this.lights[3].enable();
            //console.log('ola');
        } else {
            this.lights[3].disable();
            //console.log('xau');
        }
        this.lights[3].update();

        if (this.light4) {
            this.lights[4].enable();
            //console.log('ola');
        } else {
            this.lights[4].disable();
            //console.log('xau');
        }
        this.lights[4].update();


        //TODO want to do like this, should ask later 
        /* for (let i = 0; i < this.lights.length; i++) {
          if(this.getSwitch(i)){
              this.lights[i].enable(); 
              //console.log('ola');
          }else{
              this.lights[1].disable();
              //console.log('xau');
          }
          this.lights[i].update();
      }*/
    }

    initTextures() {
        this.textures = [];
        for (var key in this.graph.textures) {
            var texture = this.graph.textures[key];
            this.textures.push(texture);
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.globals[0], this.graph.globals[1], this.graph.globals[2], this.graph.globals[3]);

        //MANIP test
        this.initCameras();

        this.initLights();

        this.initTextures();

        //update UI usuing sata structures passed 
        this.interface.updateInterface();

        this.sceneInited = true;
    }

    checkKeys() {
         if (this.gui.isKeyPressed("KeyM") ) { //when key is released
            if(!this.keysPressed){
                this.graph.updateMaterials();
                this.keysPressed=true;
            }
            if(this.keysPressed){
                return; 
            }
        }

        this.keysPressed = false;
        
    }
    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();
        this.views;

        this.pushMatrix();
        if (this.displayAxis)
            this.axis.display();

        this.checkKeys();
        this.updateLights();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}

//TODO textures? 