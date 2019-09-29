/**TODO
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param radius - Radius of the sphere
 * @param slices - Number of divisions around axis
 * @param stacks - Number of divisions between poles
 */
class MySphere extends CGFobject {
	constructor(scene, id, radius, slices, stacks) {
		super(scene);
		this.radius = radius;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	}
	
	initBuffers() {
		var d_theta = (Math.PI/2)/this.slices;
		var d_phi = (2*Math.PI)/this.stacks;

		var theta = 0;
		var phi = 0;

		this.vertices = [];
		this.normals = [];
		this.indices = [];

		for (var i = 0; i < this.slices; i++) {
			for (var j = 0; j < this.stacks; j++) {

				//Normals
				var nx = Math.cos(theta)*Math.cos(phi);
				var ny = Math.cos(theta)*Math.sin(phi);
				var nz = Math.sin(theta);

				//Coordinates
				var x = this.radius*nx;
				var y = this.radius*ny;
				var z = this.radius*nz;

				//Storing values
				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, nz);

				//Preparing next iteration
				theta += d_theta;
			}

			//Preparing next iteration
			phi += d_phi;
		}

		this.texCoords = []
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}

