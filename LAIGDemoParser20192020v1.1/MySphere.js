/**TODO
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
		let d_phi = (2*Math.PI)/this.slices;
		let d_theta = (Math.PI/2)/this.stacks;

		let theta = Math.PI/2;
		let phi = 0;

		this.vertices = [];
		this.normals = [];
		this.indices = [];
		this.texCoords = [];

		for (let i = 0; i <= 2*this.stacks; i++) {
			for (let j = 0; j <= this.slices; j++) {

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

		for (let i = 0; i <= 2*this.stacks; i++)
			for (let j = 0; j <= this.slices; j++) {
				let ts = 1/this.stacks*(i/2);
				let tt = 1-1/this.slices*j;
				//Storing texCoords
				this.texCoords.push(1/this.stacks*(i/2), 1-1/this.slices*j);
			}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(lg_s, lg_t) {
		this.updateTexCoordsGLBuffers();
	}
}

