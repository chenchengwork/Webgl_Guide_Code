/**
 * 绘制单关节模型
 */

import GL_Util from './myCore/GL_Util';
import GlMatrix from './myCore/GlMatrix';

const v_sharder = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    
    varying vec4 v_Color;
    void main(){
        gl_Position = u_MvpMatrix * a_Position;
        
        vec4 color = vec4(1.0, 0.4, 0.0, 1.0);                  // 模型颜色
        vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));   // 光照方向
        vec3 normal = normalize(u_NormalMatrix * a_Normal.xyz); 
        float nDotL = max(dot(lightDirection, normal), 0.0);
        
        v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);
    }
`;

const f_sharder = `
    #ifdef GL_ES
        precision mediump float;
    #endif
    
    varying vec4 v_Color;
    
    void main(){
        gl_FragColor = v_Color;
    }
    
`;


export default function main() {
    const gl_util = new GL_Util('webgl');
    const gl = gl_util.getWebGLContext();
    const glProgram = gl_util.getGlProgram(gl, v_sharder, f_sharder);

    const n = initVertexBuffers(gl, glProgram);

    initUniformBuffers(gl);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

}

function initVertexBuffers(gl, glProgram) {
    // 顶点坐标
    const vertices = new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
        1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
        1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
        -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
        -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
        1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ]);

    // 法向量
    const normals = new Float32Array([
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ]);

    // 顶点索引
    const indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    initArrayBuffer(gl, glProgram, 'a_Position', vertices, gl.float, 3);
    initArrayBuffer(gl, glProgram, 'a_Normal', normals, gl.float, 3);
    // 解除buffer连接
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    // 写入顶点索引
    const indexBuffer = gl.createBuffer();
    if (!indexBuffer) throw new Error('init buffer failed');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

/**
 *
 * @param gl
 * @param attribute 顶点变量名称
 * @param glProgram gl编程对象
 * @param data 顶点数据
 * @param type 顶点的数据类型
 * @param num   单个顶点的坐标数量
 */
function initArrayBuffer(gl, glProgram, attribute, data, type, num){
    const buffer = gl.createBuffer();
    if (buffer) throw new Error('创建buffer失败');

    // 向buffer中写入数据
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(buffer, data, gl.STATIC_DRAW);

    // 绑定buffer到顶点变量
    const a_Attribute = gl.getAttribLocation(glProgram, attribute);
    if (!a_Attribute) throw new Error('glProgram 获取顶点变量失败');

    gl.vertexAttribPointer(a_Attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_Attribute);    // 开启顶点buffer
    return true;
}


function initUniformBuffers(gl, glProgram) {

}

function doDraw(gl, glProgram) {
    var ANGLE_STEP = 3.0;    // 旋转角度步长
    var g_arm1Angle = -90.0; // The rotation angle of arm1 (degrees)
    var g_joint1Angle = 0.0; // The rotation angle of joint1 (degrees)

    const u_MvpMatrix = gl.getUniformLocation(glProgram, 'u_MvpMatrix');
    const u_NormalMatrix = gl.getUniformLocation(glProgram, 'u_NormalMatrix');


    return () => {
        var arm1Length = 10.0; // Length of arm1
        // g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
        g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);    // Rotate around the y-axis
        const translateMatrix = GlMatrix.getTranslateMat4([0.0, -12.0, 0.0]);
        const rotateMatrix = GlMatrix.getRotationMat4(g_arm1Angle, [0.0, 1.0, 0.0]); // 绕y轴旋转

        // Arm2
        GlMatrix.getTranslateMat4([0.0, arm1Length, 0.0]); 　　　// Move to joint1
        GlMatrix.getRotationMat4(g_joint1Angle, [0.0, 0.0, 1.0]);  // Rotate around the z-axis
        g_modelMatrix.scale(1.3, 1.0, 1.3); // Make it a little thicker

    }
}
