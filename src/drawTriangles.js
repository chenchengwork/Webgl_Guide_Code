/**
 * 绘制三角形
 */


import {
	getWebGLContext,
	initShaders
} from './core/cuon-utils';

const VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	uniform mat4 u_xformMatrix;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_xformMatrix * a_Position;
		v_Color = a_Color;
	}
`;

const FSHADER_SOURCE = `
	#ifdef GL_ES
		precision mediump float;	
	#endif
	
	varying vec4 v_Color;
	void main(){
		gl_FragColor = v_Color;
	}
`;

export default function main() {
	const gl = getWebGLContext(document.querySelector('#drawTriangles'));

	if (!gl) {
		console.log('初始化webGL上下文失败');
		return false;
	}

	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
		console.log('初始化着色器失败');
		return false;
	}

	//------------绑定着色器顶点和颜色-> start-------------
	const n = initVertexBuffers(gl);
	if (n < 0) {
		console.log("初始化顶点buffer失败");
		return false;
	}

	// 给顶点传入颜色
	const a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	gl.vertexAttrib3f(a_Color, 0.0, 1.0, 0.0);

	// 传入缩放变换矩阵
	const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
	gl.uniformMatrix4fv(u_xformMatrix, false, new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.5, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0,
	]));

	//------------绑定着色器顶点和颜色-> end-------------


	// 指定清除canvas的颜色
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// 清空canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES, 0, n);
}


const initVertexBuffers = (gl) => {
	const vertices = new Float32Array([
		0.0, 0.5,   -0.5, -0.5,   0.5, -0.5
	]);

	const n = 3;

	// 创建缓冲区对象
	const vertexBuffer = gl.createBuffer();
	// 将缓冲区对象绑定到目标
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	// 向缓冲区对象写入数据
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	// 获取顶点的位置
	const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return false;
	}

	// 将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	// 连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	return n;
}
