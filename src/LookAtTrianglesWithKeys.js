import {
	getWebGLContext,
	initShaders
} from './core/cuon-utils'

import GlMatrix from './core/my-matrix';

const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	uniform mat4 u_ViewMatrix;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_ViewMatrix * a_Position;
		v_Color = a_Color;
	}
`;

const FSHADER_SOURCE = `
	#ifdef GL_ES
	precision mediump float;	// float指定精度
	#endif
	
	varying vec4 v_Color;
	void main(){
		gl_FragColor = v_Color;
	}
`;

export default function LookAtTrianglesWithKeys(){
	const canvas = document.querySelector("#webgl-LookAtTrianglesWithKeys");

	const gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log('Failed to intialize shaders.');
		return;
	}

	// Set the vertex coordinates and color (the blue triangle is in the front)
	const n = initVertexBuffers(gl);
	if (n < 0) {
		console.log('Failed to set the vertex information');
		return;
	}

	gl.clearColor(0, 0, 0, 1);

	const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	if(!u_ViewMatrix) {
		console.log('Failed to get the storage locations of u_ViewMatrix');
		return;
	}

	document.onkeydown = function(ev){ keydown(ev, gl, n, u_ViewMatrix); };

	draw(gl, n, u_ViewMatrix);   // Draw

}

const initVertexBuffers = (gl) => {
	const verticesColors = new Float32Array([
		// Vertex coordinates and color
		0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
		-0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
		0.5, -0.5,  -0.4,  1.0,  0.4,  0.4,

        // 0.0,  1.0,  0.0,  0.4,  1.0,  0.4, // The back green one
        // -1.0, -1.0,  -0.0,  0.4,  1.0,  0.4,
        // 1.0, -1.0,  -0.0,  1.0,  0.4,  0.4,


		0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
		-0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
		0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,

		0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one
		-0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
		0.5, -0.5,   0.0,  1.0,  0.4,  0.4,
	]);

	var n = 9;

	const vertexColorbuffer = gl.createBuffer();

	if (!vertexColorbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	const FSIZE = verticesColors.BYTES_PER_ELEMENT;

	const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}

	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
	gl.enableVertexAttribArray(a_Position);


	const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}

	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6,FSIZE * 3);
	gl.enableVertexAttribArray(a_Color);

	return n;
};


let g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; // Eye position
function keydown(ev, gl, n, u_ViewMatrix) {
	if(ev.keyCode == 39) { // The right arrow key was pressed
		g_eyeX += 0.01;
	} else
	if (ev.keyCode == 37) { // The left arrow key was pressed
		g_eyeX -= 0.01;
	} else { return; }
	draw(gl, n, u_ViewMatrix);
}

function draw(gl, n, u_ViewMatrix) {
	// 获取相机实视图
	const cameraView = GlMatrix.getLookAtMatrix([g_eyeX, g_eyeY, g_eyeZ], [0, 0, 0], [0, 1, 0]);
	console.log(cameraView);
	gl.uniformMatrix4fv(u_ViewMatrix, false, cameraView);

	gl.clear(gl.COLOR_BUFFER_BIT);     // Clear <canvas>

	gl.drawArrays(gl.TRIANGLES, 0, n); // Draw the rectangle
}



