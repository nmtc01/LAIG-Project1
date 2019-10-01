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

        // add a group of controls (and open/expand by defult)
        // this.gui.add(this.scene, 'selectedView', this.scene.lightIDs).name('Select View')
        this.gui.add(this.scene, 'selectedCamera', this.scene.cameraIDs)
            .name('Select Camera: ')
            .onChange(val => this.scene.updateCameras(val));

        this.initKeys();

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
}