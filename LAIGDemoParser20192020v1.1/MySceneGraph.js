var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        //utilities for compoents 
        this.newTransformationID = 0;

        // File reading 
        this.reader = new CGFXMLreader();

        this.change_material_id = 0;

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <globals>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError("tag <gloabals> out of order");

            //Parse globals block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        //Get view id
        var idDefaultView = this.reader.getString(viewsNode, 'default')
        if (idDefaultView == null)
            return "no view defined for scene";

        //Get views
        this.views = [];
        var children = viewsNode.children;
        var grandChildren = [];

        //Any number of views
        var numViews = 0;

        for (var i = 0; i < children.length; i++) {

            //Get name of the current view
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            var type = children[i].nodeName;

            //Get id of the current view
            var viewId = this.reader.getString(children[i], 'id');
            if (viewId == null)
                return "no ID defined for view";
            //Check for repeated ids
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            //Get view near and far
            var near = this.reader.getFloat(children[i], 'near');
            var far = this.reader.getFloat(children[i], 'far');
            //Check if far is greater than near
            if (near >= far)
                return "Near must be smaller than far";

            //Divind the storage in two different options of views
            if (children[i].nodeName == "perspective") {
                //Get view angle and store it
                var angle = this.reader.getFloat(children[i], 'angle');
                if (angle == null)
                    return "no angle defined for view";

            }
            else {
                //Get the additional attributes of the ortho view and store them
                var left = this.reader.getFloat(children[i], 'left');
                var right = this.reader.getFloat(children[i], 'right');
                var top = this.reader.getFloat(children[i], 'top');
                var bottom = this.reader.getFloat(children[i], 'bottom');
                if (left == null || right == null || top == null || bottom == null)
                    return "missing attributes on ortho view";
            }

            //Get view grandChildren info
            grandChildren = children[i].children;
            var nodeNames = [];
            var last_name = "";
            var up = [];

            for (var j = 0; j < grandChildren.length; j++) {

                //Get grandChild name
                var name = grandChildren[j].nodeName;
                if (name == null) {
                    this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                    continue;
                }

                //Checking correct order
                switch (name) {
                    case "from":
                        {
                            if (last_name == "") {

                                //Get Attributes
                                var from = this.parseCoordinates3D(grandChildren[j], "view position for ID" + viewId);

                                nodeNames.push(name);

                                last_name = "from";
                            }
                            else {
                                nodeNames = [];
                                attributes = [];
                                return "Incorrect order of tags";
                            }
                            break;
                        }
                    case "to":
                        {
                            if (last_name == "from") {

                                //Get Attributes
                                var to = this.parseCoordinates3D(grandChildren[j], "view position for ID" + viewId);

                                nodeNames.push(name);


                                last_name = "to";

                                if (children[i].nodeName == "ortho")
                                    up.push(...[0, 1, 0]);
                            }
                            else {
                                nodeNames = [];
                                attributes = [];
                                return "Incorrect order of tags";
                            }
                            break;
                        }
                    case "up":
                        {
                            if (last_name == "to" && children[i].nodeName == "ortho") {

                                //Get Attributes
                                var up = this.parseCoordinates3D(grandChildren[j], "view position for ID" + viewId);

                                last_name = "up";
                            }
                            else {
                                nodeNames = [];
                                attributes = [];
                                return "Incorrect order of tags";
                            }
                            break;
                        }
                    default:
                        this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                        break;
                }
            }

            //we choose to switch this to an array like struct so that 
            //it can easilly be understandable on array index manipulation

            //Store info  const 
            var view_info = {};
            switch (children[i].nodeName) {
                case 'perspective':
                    view_info = {
                        type,
                        viewId,
                        near,
                        far,
                        angle,
                        from,
                        to
                    }
                    break;
                case 'ortho':
                    view_info = {
                        type,
                        viewId,
                        near,
                        far,
                        left,
                        right,
                        top,
                        bottom,
                        from,
                        to,
                        up
                    }
                    break;
            }
            //Store views
            this.views[viewId] = view_info;
            numViews++;
        }

        //At least one view
        if (numViews == 0)
            return "at least one view must be defined";

        this.log("Parsed views");
        return null;
    }

    /**
    * Parses the <globals> node.
    * @param {globals block element} globalsNode
    */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.globals = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var globalsIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[globalsIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.globals = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed globals");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];
        var attenuation = []; //{constant,linear,quadratic}

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || -1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            //was later added added - Parse attenuation
            let attenuationIndex = nodeNames.indexOf("attenuation"); //get attenuation xml index
            if (attenuationIndex == -1)
                return "no attenuation defined at light with id: " + lightId;
            else {//set attenuation 
                //read values
                attenuation.push(this.reader.getFloat(grandChildren[attenuationIndex], 'constant'));
                attenuation.push(this.reader.getFloat(grandChildren[attenuationIndex], 'linear'));
                attenuation.push(this.reader.getFloat(grandChildren[attenuationIndex], 'quadratic'));
            }
            //store attenuation
            global.push(attenuation);

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }
            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        var children = texturesNode.children;
        this.textures = [];

        for (var i = 0; i < children.length; i++) {

            let valid = true; //valid texture

            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            // Get id of the current texture.
            let textureId = this.reader.getString(children[i], 'id');
            if (textureId == null)
                return "no ID defined for texture";

            // Get texture file link 
            let file = this.reader.getString(children[i], 'file');
            if (file == null)
                return "no file defined for texture";

            // Checks for repeated files.
            for (let k = 0; k < this.textures.length; k++) {
                let id = this.textures[k][0];
                let f = this.textures[k][1];
                if (this.textures[k][0] == textureId)
                    return "ID must be unique for each texture (conflict: ID = " + textureId + ")";
                if (this.textures[k][1] == file)
                    return "file name must be unique for each texture (conflict: Name = " + file + ")";
            }

            //Check if it is a valid file
            if (file.length < 4) {
                this.onXMLMinorError("invalid file: " + file);
                valid = false;
            }
            let extension = file.substring(file.length - 4);
            if (extension != ".jpg" && extension != ".png" && valid) {
                this.onXMLMinorError("invalid file extension: " + file);
                valid = false;
            }

            //Check if file exists
            if (valid) {
                let xhr = new XMLHttpRequest();
                xhr.open('HEAD', file, false);
                xhr.send();

                if (xhr.status == "404") {
                    this.onXMLMinorError("unexisting file: " + file);
                    valid = false;
                }
            }

            //Store valid texture
            if (valid) {
                let newTexture = new CGFtexture(this.scene, file);
                this.textures[textureId] = newTexture;
            }

        }

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            let newMaterial = new CGFappearance(this.scene);

            let r = 0, g = 0, b = 0, a = 0; //local valeus to store components info 

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material:" + materialID;

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (shininess <= 0)
                return "Shininess of the appearance. MUST BE positive, non-zero ( shininess : " + shininess + ")";

            //Pass shininess 
            newMaterial.setShininess(shininess);

            //get node names 
            nodeNames = [];
            grandChildren = children[i].children;
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            //parse emission
            if (grandChildren[0].nodeName == 'emission') {
                r = this.reader.getFloat(grandChildren[0], 'r');
                g = this.reader.getFloat(grandChildren[0], 'g');
                b = this.reader.getFloat(grandChildren[0], 'b');
                a = this.reader.getFloat(grandChildren[0], 'a');

                newMaterial.setEmission(r, g, b, a);

            } else return 'Error material emission was not declared on the *.xml'

            //parse ambient 
            if (grandChildren[1].nodeName == 'ambient') {
                r = this.reader.getFloat(grandChildren[1], 'r');
                g = this.reader.getFloat(grandChildren[1], 'g');
                b = this.reader.getFloat(grandChildren[1], 'b');
                a = this.reader.getFloat(grandChildren[1], 'a');

                newMaterial.setAmbient(r, g, b, a);

            } else return 'Error material emission was not declared on the *.xml'

            //parse difuse
            if (grandChildren[2].nodeName == 'diffuse') {
                r = this.reader.getFloat(grandChildren[2], 'r');
                g = this.reader.getFloat(grandChildren[2], 'g');
                b = this.reader.getFloat(grandChildren[2], 'b');
                a = this.reader.getFloat(grandChildren[2], 'a');

                newMaterial.setDiffuse(r, g, b, a);

            } else return 'Error material emission was not declared on the *.xml'

            //parse specular 
            if (grandChildren[3].nodeName == 'specular') {
                r = this.reader.getFloat(grandChildren[3], 'r');
                g = this.reader.getFloat(grandChildren[3], 'g');
                b = this.reader.getFloat(grandChildren[3], 'b');
                a = this.reader.getFloat(grandChildren[3], 'a');

                newMaterial.setSpecular(r, g, b, a);

            } else return 'Error material emission was not declared on the *.xml'

            this.materials[materialID] = newMaterial;
        }
        this.log("Parsed materials");
        return null;
    }
    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            //create unit matrix 
            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {

                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        //update matrix
                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;
                        //update matrix
                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);

                        break;
                    case 'rotate':
                        var axis = this.reader.getString(grandChildren[j], 'axis');
                        if (axis != "x" && axis != "y" && axis != "z")
                            return "invalid rotation axis";

                        var angle = this.reader.getFloat(grandChildren[j], 'angle');
                        angle = angle * Math.PI / 180;
                        //update matrix
                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle, this.axisCoords[axis]);
                        break;
                }
            }
            //store tranformation matrix
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");

        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)";
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            switch (primitiveType) {
                case ('rectangle'):

                    // x1
                    var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                    if (!(x1 != null && !isNaN(x1)))
                        return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                    // y1
                    var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                    if (!(y1 != null && !isNaN(y1)))
                        return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                    // x2
                    var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                    if (!(x2 != null && !isNaN(x2) && x2 > x1))
                        return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                    // y2
                    var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                    if (!(y2 != null && !isNaN(y2) && y2 > y1))
                        return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                    var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                    this.primitives[primitiveId] = rect;

                    break;

                case ('triangle'):

                    // x1
                    var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                    if (!(x1 != null && !isNaN(x1)))
                        return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                    // y1
                    var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                    if (!(y1 != null && !isNaN(y1)))
                        return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                    // z1
                    var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                    if (!(z1 != null && !isNaN(z1)))
                        return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                    // x2
                    var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                    if (!(x2 != null && !isNaN(x2)))
                        return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                    // y2
                    var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                    if (!(y2 != null && !isNaN(y2)))
                        return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                    // z2
                    var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                    if (!(z2 != null && !isNaN(z2)))
                        return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;

                    // x3
                    var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                    if (!(x3 != null && !isNaN(x3)))
                        return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                    // y3
                    var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                    if (!(y3 != null && !isNaN(y3)))
                        return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                    // z3
                    var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                    if (!(z3 != null && !isNaN(z3)))
                        return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                    var triangle = new MyTriangle(this.scene, primitiveId, x1, x2, x3, y1, y2, y3, z1, z2, z3);

                    this.primitives[primitiveId] = triangle;

                    break;

                case ('cylinder'):

                    //base
                    var base = this.reader.getFloat(grandChildren[0], 'base');
                    if (!(base != null && !isNaN(base)))
                        return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                    //top    
                    var top = this.reader.getFloat(grandChildren[0], 'top');
                    if (!(top != null && !isNaN(top)))
                        return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                    //height
                    var height = this.reader.getFloat(grandChildren[0], 'height');
                    if (!(height != null && !isNaN(height)))
                        return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                    //slices
                    var slices = this.reader.getInteger(grandChildren[0], 'slices');
                    if (!(slices != null && !isNaN(slices)))
                        return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                    //stacks
                    var stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                    if (!(stacks != null && !isNaN(stacks)))
                        return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                    var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                    this.primitives[primitiveId] = cylinder;

                    break;

                case ('sphere'):

                    //radius
                    var radius = this.reader.getFloat(grandChildren[0], 'radius');
                    if (!(radius != null && !isNaN(radius)))
                        return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                    //slices
                    var slices = this.reader.getInteger(grandChildren[0], 'slices');
                    if (!(slices != null && !isNaN(slices)))
                        return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                    //stacks
                    var stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                    if (!(stacks != null && !isNaN(stacks)))
                        return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                    var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                    this.primitives[primitiveId] = sphere;

                    break;

                case ('torus'):

                    //innes
                    var inner = this.reader.getFloat(grandChildren[0], 'inner');
                    if (!(inner != null && !isNaN(inner)))
                        return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                    //outer
                    var outer = this.reader.getFloat(grandChildren[0], 'outer');
                    if (!(outer != null && !isNaN(outer)))
                        return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                    //slices
                    var slices = this.reader.getInteger(grandChildren[0], 'slices');
                    if (!(slices != null && !isNaN(slices)))
                        return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                    //loops
                    var loops = this.reader.getInteger(grandChildren[0], 'loops');
                    if (!(loops != null && !isNaN(loops)))
                        return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                    var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);

                    this.primitives[primitiveId] = torus;
                    break;

            }
        }
        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID:" + componentID;

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];

            //process grandchilder ramifications 
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            //save component infos
            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");


            // Transformations -- Bloco pode ficar sem conteudo
            if (transformationIndex != -1) {
                grandgrandChildren = grandChildren[transformationIndex].children;
                var transformation;

                if (grandgrandChildren.length == 0) {
                    var mat = mat4.create();
                    transformation = mat;
                }
                else if (grandgrandChildren[0].nodeName == "transformationref") {
                    var transfref = this.reader.getString(grandgrandChildren[0], 'id');
                    //check if that reference exists 
                    if (this.transformations[transfref] == null)
                        return "Transformation id does has not been declared: " + transfref;
                    transformation = this.transformations[transfref];
                }
                else {
                    //create new transformation
                    var mat = mat4.create();
                    for (var j = 0; j < grandgrandChildren.length; j++) {
                        //if is a reference, save the ref name 
                        switch (grandgrandChildren[j].nodeName) {
                            case 'translate':
                                var coordinates = this.parseCoordinates3D(grandgrandChildren[j], "translate transformation for ID " + this.newTransformationID);
                                if (!Array.isArray(coordinates))
                                    return coordinates;
                                mat = mat4.translate(mat, mat, coordinates);
                                break;
                            case 'scale':
                                var coordinates = this.parseCoordinates3D(grandgrandChildren[j], "translate transformation for ID " + this.ewTransformationID);
                                if (!Array.isArray(coordinates))
                                    return coordinates;
                                mat = mat4.scale(mat, mat, coordinates);
                                break;
                            case 'rotate':
                                var axis = this.reader.getString(grandgrandChildren[j], 'axis');
                                if (axis != "x" && axis != "y" && axis != "z")
                                    return "invalid rotation axis";
                                var angle = this.reader.getFloat(grandgrandChildren[j], 'angle');
                                angle = angle * Math.PI / 180;
                                mat = mat4.rotate(mat, mat, angle, this.axisCoords[axis]);
                        }
                        transformation = mat;
                    }
                }
            }
            else return "transformation block must be declared";

            // Materials -- Obrigatorio 
            if (materialsIndex != -1) {
                grandgrandChildren = grandChildren[materialsIndex].children;
                var component_materials = [];

                for (let k = 0; k < grandgrandChildren.length; k++) {
                    if (grandgrandChildren[k].nodeName != 'material')
                        return "Material child should be caled <material/>"
                    var materialID = this.reader.getString(grandgrandChildren[k], 'id')
                    //IF MATERIAL IS INHERITABLE 
                    if (materialID == 'inherit') {
                        component_materials.push(materialID);
                        break;
                    }
                    if (this.materials[materialID] == null) {
                        return "material declared on component doesnt exist: " + materialID;
                    } else component_materials.push(this.materials[materialID]);
                }
            }
            else return "materials block must be declared";

            // Texture -- Obrigatorio
            if (textureIndex != -1) {
                var length_s = 1;
                var length_t = 1;

                var textureref = this.reader.getString(grandChildren[textureIndex], 'id');
                if (textureref != 'inherit' && textureref != 'none') {
                    if (this.textures[textureref] == null)
                        return "texture declared on component doesnt not exist: " + textureref;
                    textureref = this.textures[textureref];
                    //Handling lengths
                    length_s = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                    if (length_s == null)
                        return "texture must have a length_s declared"
                    length_t = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
                    if (length_t == null)
                        return "texture must have a length_t declared"
                }
                else {
                    if (this.reader.hasAttribute(grandChildren[textureIndex], 'length_s')) {
                        return "texture should not have a length_s declared"
                    }
                    if (this.reader.hasAttribute(grandChildren[textureIndex], 'length_t')) {
                        return "texture should not have a length_t declared"
                    }
                }

            }
            else return "texture module not declared"

            // Children
            if (childrenIndex != -1) {

                grandgrandChildren = grandChildren[childrenIndex].children;
                if (grandgrandChildren.length == 0)
                    return "Component - children, must have ate least one component/primitive ref"
                var componentrefIDs = [];
                var primitiverefIDs = [];


                for (let k = 0; k < grandgrandChildren.length; k++) {
                    var auxID = this.reader.getString(grandgrandChildren[k], 'id');
                    switch (grandgrandChildren[k].nodeName) {
                        case 'componentref':
                            componentrefIDs.push(auxID);
                            break;
                        case 'primitiveref':
                            if (this.primitives[auxID] == null)
                                return "Primitive referenced  on component does not exist"
                            primitiverefIDs.push(this.primitives[auxID]);
                            break;
                    }
                }

            }
            else "children block must be declared"
            let visited = false;
            //store the data and pass it as a structure into the array 
            const component = { //node 
                componentID,
                visited,
                component_materials,
                transformation,
                texture: {
                    textureref,
                    length_s,
                    length_t
                },
                children: {
                    componentrefIDs,
                    primitiverefIDs
                }
            }
            this.components[component.componentID] = component;
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }
    /**
     * increse index to change materials on the scene
     */
    updateMaterials() {
        this.change_material_id++;
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     * @param {component componentID} child -  current node that teh graph is porcessing
     * @param {component component_materials} parent_material - - save previous material factor
     * @param {component textureref} parent_texture - save previous texture 
     * @param {component textureref length_s} parent_length_s - save previous scale factor
     * @param {component textureref length_s} parent_length_t - save previous scale factor
     */
    processChild(child, parent_material, parent_texture, parent_length_s, parent_length_t) {

        if (this.components[child].visited)
            return "Component has already been visited";

        //set component as visited to avoid processing repetitions 
        this.components[child].visited = true; //set as visited

        this.scene.pushMatrix();
        this.scene.multMatrix(this.components[child].transformation);//apply tranformations 

        //Materials
        if (this.components[child].component_materials == 'inherit') { //if inherit does nothing, keeps the current material, from the parent 
            if (parent_material == null)
                return 'Error - cannot display inhreited material if there is no material declared before';
        }
        else {
            //iterate to current material state to choose
            let i = this.change_material_id % this.components[child].component_materials.length;
            parent_material = this.components[child].component_materials[i]; //update parent material - current material
        }

        //Textures
        if (this.components[child].texture.textureref == 'inherit') { 
            //controll erros if there is no texture, program stop
            if (parent_texture == null)
                return 'Error - cannot display inhreited texture if there is no texture declared before';
            //use parent texture
           parent_material.setTexture(parent_texture);
           parent_material.setTextureWrap('REPEAT', 'REPEAT');
        }
        if (this.components[child].texture.textureref == 'none') {
            //if null set nothing
            parent_material.setTexture(null);
            this.components[child].texture.length_s = 1;
            this.components[child].texture.length_t = 1;
        }
        if(this.components[child].texture.textureref != 'none' && this.components[child].texture.textureref != 'inherit'){
            //if new texture reset parent variables
            parent_texture = this.components[child].texture.textureref;
            parent_material.setTexture(parent_texture);
            parent_length_s =  this.components[child].texture.length_s;
            parent_length_t =  this.components[child].texture.length_t;
            parent_material.setTextureWrap('REPEAT', 'REPEAT');
        }

        //Apply
        parent_material.apply();
        //Process child components
        for (let i = 0; i < this.components[child].children.componentrefIDs.length; i++) {
            this.processChild(this.components[child].children.componentrefIDs[i], parent_material, parent_texture, parent_length_s, parent_length_t);
        }

        //Process end node/primitives
        for (let i = 0; i < this.components[child].children.primitiverefIDs.length; i++) {
            this.scene.pushMatrix();

            //get scale factors 
            let lg_s = this.components[child].texture.length_s;
            let lg_t = this.components[child].texture.length_t;

            //always texture coord respecting lenghth scale factors
            this.components[child].children.primitiverefIDs[i].updateTexCoords(lg_s, lg_t);

            //display primitive
            this.components[child].children.primitiverefIDs[i].display();
            this.scene.popMatrix();
        }
        this.scene.popMatrix();

        //set as unvisited so that displayScene can be caled multiple times
        this.components[child].visited = false;

    }

    //display the scene processing every node
    displayScene() {
        this.processChild(this.components["root"].componentID, this.components["root"].component_materials, this.components["root"].texture.textureref, this.components["root"].texture.length_s, this.components["root"].texture.length_t);
    }
}