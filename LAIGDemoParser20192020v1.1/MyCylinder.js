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
		let d_radius = (d_stack*this.top)/(this.height*this.base); //mal
		
		let theta = 0;
		let nr_vertices = 0;
		let radius = this.base;

		this.vertices = [];
		this.normals = [];
		this.indices = [];

		for (let i = 0; i <= this.stacks; i++) {
			for (let j = 0; j < this.slices; j++) {

				//Normals
				let nx = Math.cos(theta); //missing z
				let ny = Math.sin(theta);

				//Coordinates
				let x = radius*nx;
				let y = radius*ny;
				let z = i*d_stack;

				//Storing values
				this.vertices.push(x, y, z);
				nr_vertices++;
				this.normals.push(nx, ny, 0);
				
				//Preparing next iteration
				theta += d_theta;
			}

			//Preparing next iteration
			radius *= d_radius;
			theta = 0;
		}

		for (let i = 0; i < this.stacks; i ++) {
			for (let j = 0; j < this.slices; j++) {
				let p1 = i * this.slices + j;
				let p2 = p1 + this.slices;
				let p3 = p1 + 1;
				let p4 = p2 + 1;
				p1 = p1%nr_vertices;
				p2 = p2%nr_vertices;
				p3 = p3%nr_vertices;
				p4 = p4%nr_vertices;

				//Storing indices
				if (j < this.slices-1) //mal
					this.indices.push(p1, p3, p2, p3, p4, p2);
				else this.indices.push(p1, p4, p2, p4, p3, p2);
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

