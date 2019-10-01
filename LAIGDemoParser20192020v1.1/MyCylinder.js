/**
 * MyCylinder.js
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Sphere id
 * @param base - Radius of the base
 * @param top - Radius of the top
 * @param height - Size in the direction of the positive Z axis
 * @param slices - Number of divisions around the circumference
 * @param stacks - Number of divisions along the Z direction 
 */
class MyCylinder extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
		super(scene);
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	}
	
	initBuffers() {
		let d_theta = (Math.PI/2)/this.stacks;
		let d_stack = this.height/this.stacks;

		let theta = Math.PI/2;

		this.vertices = [];
		this.normals = [];
		this.indices = [];

		for (let i = 0; i < this.stacks; i += d_stack) {
			for (let j = 0; j < this.slices; j++) {

				//Normals
				let nx = Math.cos(theta);
				let ny = Math.sin(theta);

				//Coordinates
				let x = this.base*nx;
				let y = this.base*ny;
				let z = i;

				//Storing values
				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, 0);
				
				//Preparing next iteration
				theta += d_theta;
			}
		}

		for (let i = 0; i < this.stacks; i += d_stack) {
			for (let j = 0; j < this.slices; j++) {
				let p1 = i * (this.slices+1) + j;
				let p2 = p1 + (this.slices+1);
				//Storing indices
				this.indices.push(
					p1, p2, p1 + 1, p1 + 1, p2, p2 + 1
				);
			}
		}

		this.texCoords = [];
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

