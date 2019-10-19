/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - Sphere id
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
		//variation of algle between slices
		let d_phi = (2*Math.PI)/this.slices;
		//variation of algle between stacks
		let d_theta = (Math.PI/2)/this.stacks;

		//angles starting values 
		let theta = Math.PI/2; //sphere works by drawing 2 semispheres, and we have to consider negative angles
		let phi = 0;

		//arrays to store primitives data
		this.vertices = [];
		this.normals = [];
		this.indices = [];
		this.texCoords = [];

		//create vertices and normals, again all equation given in theorical classes
		for (let i = 0; i <= 2*this.stacks; i++) { //secondly process stacks, as height
			for (let j = 0; j <= this.slices; j++) { //firstly precoss slices, as they are the radius in each stack

				//Normals
				let nx = Math.cos(theta)*Math.cos(phi);
				let ny = Math.cos(theta)*Math.sin(phi);
				let nz = Math.sin(theta);

				//Coordinates
				let x = this.radius*nx;
				let y = this.radius*ny;
				let z = this.radius*nz;

				//Storing values
				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, nz);
				
				//Preparing next iteration
				phi += d_phi;
			}

			//Preparing next iteration
			phi = 0;
			theta += d_theta;
		}

		for (let i = 0; i < 2*this.stacks; i++) {
			for (let j = 0; j < this.slices; j++) {
				let p1 = i * (this.slices+1) + j;
				let p2 = p1 + (this.slices+1);

				//Storing indices
				this.indices.push(
					p1, p2, p1 + 1, p1 + 1, p2, p2 + 1
				);
			}
		}
		//create texcoords
		//textures are painted like wrapping a sphere with paper, staring on the center of the paper
		for (let i = 0; i <= 2*this.stacks; i++)
			for (let j = 0; j <= this.slices; j++) {
				//Storing texCoords
				this.texCoords.push(1/this.slices*(i/2), 1-1/this.slices*j); 
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

