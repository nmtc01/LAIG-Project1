/** 
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, x3, y1, y2 ,y3, z1, z2, z3) {
		
		super(scene);
		
		this.x1 = x1; 
		this.x2 = x2; 
		this.x3 = x3;
		this.y1 = y1; 
		this.y2 = y2; 
		this.y3 = y3; 
		this.z1 = z1; 
		this.z2 = z2; 
		this.z3 = z3; 

		//calculate distances of triangle sides 
		this.a = Math.sqrt((x1-x3)^2 + (y1-y3)^2 + (z1-z3)^2 ); 
		this.b = Math.sqrt((x2-x1)^2 + (y2-y1)^2 + (z2-z1)^2 ); 
		this.c = Math.sqrt((x3-x2)^2 + (y3-y2)^2 + (z3-z2)^2 ); 

		//cos of the algles between all sides
		this.cos_alpha = ((this.a)^2+(this.b)^2+(this.c)^2)/(2*this.b*this.c)
		this.cos_beta = ((this.a)^2-(this.b)^2+(this.c)^2)/(2*this.a*this.c)
		this.cos_gama = ((this.a)^2+(this.b)^2+-(this.c)^2)/(2*this.a*this.b)

		//caculate auxiliar normals
		var v1 = [this.x2-this.x1, this.y2-this.y1, this.z2-this.z1];
		var v2 = [this.x3-this.x1, this.y3-this.y1, this.z3-this.z1];

		//calculate normals on each edge 
		this.nx= v1[1]*v2[2] - v1[2]*v2[1];
		this.ny= v1[2]*v2[0] - v1[0]*v2[2];
		this.nz= v1[0]*v2[1] - v1[1]*v2[0];

		this.initBuffers();
	}
	
	initBuffers() {
		//store vertices
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		//Facing Z positive
		//store normals
		this.normals = [
			this.nx,this.ny,this.nz,
			this.nx,this.ny,this.nz,
			this.nx,this.ny,this.nz
		];
		//all equations are the same as the ones on the slides at moodle
		let a = Math.sqrt(Math.pow(this.x2-this.x1,2) + Math.pow(this.y2-this.y1,2));
		let b = Math.sqrt(Math.pow(this.x3-this.x2,2) + Math.pow(this.y3-this.y2,2))
		let c = Math.sqrt(Math.pow(this.x3-this.x1,2) + Math.pow(this.y3-this.y1,2));
		let cos_alfa = ((Math.pow(a,2)-Math.pow(b,2)+Math.pow(c,2))/(2*a*c));
		//store texcoords
		this.texCoords = [
			0, 0, //t1
			a, 0, //t2
			c*cos_alfa, c*Math.sqrt(1-Math.pow(cos_alfa, 2)) //t3
		];
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 * @param {int} lg_s- Sacling factor length
	 * @param {int} lg_s- Sacling factor length
	 */
	updateTexCoords(lg_s, lg_t) {
		//all equations are the same as the ones on the slides at moodle
		let a = Math.sqrt(Math.pow(this.x2-this.x1,2) + Math.pow(this.y2-this.y1,2) + Math.pow(this.z2-this.z1,2));
		let b = Math.sqrt(Math.pow(this.x3-this.x2,2) + Math.pow(this.y3-this.y2,2)+ Math.pow(this.z3-this.z2,2))
		let c = Math.sqrt(Math.pow(this.x3-this.x1,2) + Math.pow(this.y3-this.y1,2)+ Math.pow(this.z3-this.z1,2));
		let cos_alfa = ((Math.pow(a,2)-Math.pow(b,2)+Math.pow(c,2))/(2*a*c));
		this.texCoords = [
			0, 0, //t1
			a/lg_s, 0, //t2
			c*cos_alfa/lg_s, c*Math.sqrt(1-Math.pow(cos_alfa, 2))/lg_t //t3
		];
		this.updateTexCoordsGLBuffers();
	}
}

