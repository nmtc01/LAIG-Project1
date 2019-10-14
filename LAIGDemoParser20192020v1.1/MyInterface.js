/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();
        // add a group of controls (and open/expand by defult
    
        this.initKeys();

        this.gui.add(this.scene, 'displayAxis').name("Display axis");
        return true;
    }

    /**
     * initKeys
     */

    //TODO - tecla m/M deve mudar os materials da cena 
    initKeys() {
        this.scene.gui = this;
        this.processKeyboard = function () { };
        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    updateInterface(){
        this.gui.add(this.scene, 'selectedCamera',this.scene.cameraIDs)
            .name('Select Camera:')
            .onChange(val => this.scene.updateCameras(val));    

            var f0 = this.gui.addFolder('Lights');
            var i = '0';
            for( var key in this.scene.graph.lights){
                f0.add(this.scene,'light'+i).name(key);
            }
            i='0';
    
        
    }
}