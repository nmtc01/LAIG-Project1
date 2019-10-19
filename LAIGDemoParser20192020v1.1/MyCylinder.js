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
		let d_theta = (2*Math.PI)/this.slices;
		let d_stack = this.height/this.stacks;
		let d_radius = (this.base-this.top)/this.height;
		
		//angle starting values 
		let theta = 0;	
		let radius = this.base;
		//normal
		let nz = (this.base-this.top)/this.height;
		
		//arrays to store primitives data
		this.vertices = [];
		this.normals = [];
		this.indices = [];
		this.texCoords = [];

		for (let i = 0; i <= this.stacks; i++) {
			for (let j = 0; j <= this.slices; j++) {

				//Normals
				let nx = Math.cos(theta); 
				let ny = Math.sin(theta);

				//Coordinates
				let x = radius*nx;
				let y = radius*ny;
				let z = i*d_stack;

				//Storing values
				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, nz); 

				//Storing textCoords
				this.texCoords.push(1/this.slices*j, 1/this.stacks*i);
				
				//Preparing next iteration
				theta += d_theta;
			}

			//Preparing next iteration
			radius -= d_radius*d_stack;
			theta = 0;
		}
		for (let i = 0; i < this.stacks; i ++) {
			for (let j = 0; j <= this.slices; j++) {
				let p1 = i * (this.slices+1) + j;
				let p2 = p1 + (this.slices+1);
				let p3 = p1 + 1;
				let p4 = p2 + 1;

				//Storing indices
				this.indices.push(p3, p2, p1, p4, p2, p3);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 * @param {Int} lg_s - Sacling factor length
	 * @param {Int} lg_t - Sacling factor length
	 * in this case the arguments to nothing
	 */
	updateTexCoords(lg_s, lg_t) {
		this.updateTexCoordsGLBuffers();
	}
}

