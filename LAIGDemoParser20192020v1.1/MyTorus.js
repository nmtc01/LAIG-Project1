/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
		super(scene);
		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.loops = loops;

		this.initBuffers();
	}

	initBuffers() {
		//variation of algle between loops 
		let d_phi = (2 * Math.PI) / this.loops;
		//variation of algle between slices
		let d_theta = (2 * Math.PI) / this.slices;

		//angles starting values 
		let theta = 0;
		let phi = 0;

		//arrays to store primitives data
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		//create vertices and normals 
		for (let i = 0; i <= this.loops; i++) { //secondly pross loops outer radius 
			for (let j = 0; j <= this.slices; j++) { //first process inner radius 
				
				//Normals
				let nx = Math.cos(theta) * Math.cos(phi);
				let ny = Math.cos(theta) * Math.sin(phi);
				let nz = Math.sin(theta);

				//Coords
				let x = (this.outer + this.inner * Math.cos(theta)) * Math.cos(phi);
				let y = (this.outer + this.inner * Math.cos(theta)) * Math.sin(phi);
				let z = this.inner* Math.sin(theta);

				//all equations used for the vertices and normals, where given in theorical classes

				//TextCoords
				this.texCoords.push(i/this.loops,j/this.slices);

				//store into arrays 
				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, nz);
				
				//increment angle, advance for next slice
				theta += d_theta;
				
			}
			//increment angle, advance for next loops
			phi += d_phi;
			
			//reset theta to create new data
			theta = 0;
		}
		
		//create index - similar to the processment in sphere
		for (let i = 0; i < this.loops; i++) {
			for (let j = 0; j < this.slices; j++) {
				let p1 = i * (this.slices + 1) + j;
				let p2 = p1 + (this.slices + 1);
				//Storing indices
				this.indices.push(
					p1, p2, p1 + 1, p1 + 1, p2, p2 + 1
				);
			}
		}
		//create texcoords
		//textures are painted by starting on the inner radius of the torus surface covering the external side evantually coming back to the inner radius again 
		for (let i = 0; i <= 2*this.slices; i++)
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

