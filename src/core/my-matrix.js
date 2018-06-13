import * as glMatrix from 'gl-matrix/src/gl-matrix';

export default class GlMatrix {
    static glMatrix = glMatrix;

    /**
     * 获取视图矩阵
     * @param {Array} eye   [x, y, z]
     * @param {Array} center [x, y, z]
     * @param {Array} up    [x, y, z]
     * @returns {Float32Array}
     */
    static getLookAtMatrix(eye = [], center = [], up = []) {
        const lookAtMatrix = glMatrix.mat4.create();
        const eyeVec3 = glMatrix.vec3.fromValues(...eye);
        const centerVec3 = glMatrix.vec3.fromValues(...center);
        const upVec3 = glMatrix.vec3.fromValues(...up);
        glMatrix.mat4.lookAt(lookAtMatrix, eyeVec3, centerVec3, upVec3 );

        return lookAtMatrix;
    }




}

