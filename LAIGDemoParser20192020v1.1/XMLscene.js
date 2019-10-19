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

        //initiliaze a camare build buy the program ignoring the xml
        this.initDefaultCamera();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        //interface utils
        this.displayAxis = true; //axis state
        this.lightSwitch = [true, false, false, false, false, false, false, false]; //array containing light states
        this.selectedCamera = 0; //store index of the selected camera
        this.keysPressed=false; //used to avoid infinite key pressing, always assume one tap, and reset with realease

    }

    initDefaultCamera() {
        //default camera 
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0)); 
    }
    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        //array to store enabled cameras, got from from views
        this.cameras = {};
        this.cameraIDs = [];
        let aux = true;
        //loop to iterate throught cameras read on xml, this loop was originaly made on the file presented
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
                //set the first camera passed as the deafult one 
                if (aux) {
                    this.camera = this.cameras[view.viewId];
                    this.interface.setActiveCamera(this.cameras[view.viewId]); //set camera
                    aux = false; //so the program only do this condition once
                }

            }
        }
        //at least one camere needs to be defined
        if (this.cameras.length != 0)
            return "no cameras were defined";
    }
    //Update camera upon change on interface
    updateCameras(val) {
        this.camera = this.cameras[val]; //get the camera using val passed on the interface, set as main camera
        this.interface.setActiveCamera(this.cameras[val]); //set the camera
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

            //another loop presented on the files given at moodle
            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                //set light attenuations - added futher 
                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);
                //indexes had to be incremented, so that we could add the attenuations.
                
                //added further info if it is a spotlight
                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);
                    this.lights[i].setSpotDirection(light[9][0], light[9][1], light[9][2]);
                }

                this.lights[i].setVisible(true); // always set the light as visible and the change further
                if (this.graph.lights[key][0]==true){ //if the xml defines light as enabled
                    this.lights[i].enable(); //turn it on
                    this.lightSwitch[i] = true;
                }
                else{//if the xml defines light as disabled
                    this.lights[i].disable(); //turn of the light
                    this.lightSwitch[i] = false;
                }
                this.lights[i].update(); //always update the lights used
                i++; //count cameras defined
            }
        }
    }

    //Update Lights upon change on interface
    updateLights() {
        //loop over lightswitch array to know wither to turn the light off or on 
        for(let i =0; i<this.lights.length; i++){
            if(this.lightSwitch[i]){
                this.lights[i].enable(); 
            }
            else{
                this.lights[i].disable();  
            } 
            this.lights[i].update(); //update current light states
        }

         }
    
    //init textures read on xml storing them on global texture array
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

        this.initCameras();

        this.initLights();

        this.initTextures();

        //update UI usuing data structures passed 
        this.interface.updateInterface();

        this.sceneInited = true;
    }

    checkKeys() {
         if (this.gui.isKeyPressed("KeyM") ) { 
            if(!this.keysPressed){ //when key is pressed at the first time
                this.graph.updateMaterials();
                this.keysPressed=true; //set as true
            }
            if(this.keysPressed){ //avoid infinite key press calls
                return; 
            }
        }

        this.keysPressed = false; //reset flag when kley is released
        
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
        if (this.displayAxis) //display only if the curent interface state allows
            this.axis.display();

        this.checkKeys();
        this.updateLights(); //always update light state

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