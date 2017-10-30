// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' + // 设置顶点着色器的位置
    '  gl_PointSize = 10.0;\n' +                    // 设置点的大小
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + // 设置片元着色器颜色
    '}\n';

function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }


    // 获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    if (a_Position < 0) {
        console.error('获取attribute变量的存储位置失败');
        return false;
    }

    // 将顶点位置传给顶点变量
    // gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.vertexAttrib3fv(a_Position, new Float32Array(0.0, 0.0, 0.0)); // 矢量版函数


    // 获取uniform变量的存储位置
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor){
        console.log('获取uniform变量的存储位置失败');
        return false;
    }

    // 将颜色传递给uniform
    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);

    // Specify the color for clearing <canvas>
    // 指定清除canvas的颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // 清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw a point
    gl.drawArrays(gl.POINTS, 0, 1);
}
