/**TODO
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

		let d_phi = (2 * Math.PI) / this.loops;
		let d_theta = (2 * Math.PI) / this.slices;

		let theta = 0;
		let phi = 0;

		this.vertices = [];
		this.indices = [];
		this.normals = [];

		//create vertices and normals 
		for (let i = 0; i <= this.slices; i++) {
			for (let j = 0; j <= this.loops; j++) {
 
				//Normals
				let nx = Math.cos(theta) * Math.cos(phi);
				let ny = Math.cos(theta) * Math.sin(phi);
				let nz = Math.sin(theta);

				//Coords
				let x = (this.outer + this.inner * Math.cos(theta)) * Math.cos(phi);
				let y = (this.outer + this.inner * Math.cos(theta)) * Math.sin(phi);
				let z = this.inner* Math.sin(theta);

				this.vertices.push(x, y, z);
				this.normals.push(nx, ny, nz);
theta += d_theta;
				
			}
			phi += d_phi;
			
			theta = 0;
		}
		//create index

		for (let i = 0; i < this.slices; i++) {
			for (let j = 0; j < this.slices; j++) {
				let p1 = i * (this.slices + 1) + j;
				let p2 = p1 + (this.slices + 1);
				//Storing indices
				this.indices.push(
					p1, p2, p1 + 1, p1 + 1, p2, p2 + 1
				);
				

			}
		}
		
		this.texCoords = []; //TODO
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

