function main() {

  const fieldOfViewRadians = degToRad(60);

  function computeMatrix(viewProjectionMatrix, translation, rotations, translations, scalings) {
    let matrix = m4.translate(
      viewProjectionMatrix,
      translation[0],
      translation[1],
      translation[2],
    );
    matrix = m4.xRotate(matrix, rotations[0]);
    matrix = m4.zRotate(matrix, rotations[2]);
    matrix = m4.translate(matrix, translations[0], translations[1], translations[2]);
    matrix = m4.scale(matrix, scalings[0], scalings[1], scalings[2]);
    matrix = splineCurve(matrix, 50 - config.curve, [75, 0, 0, -75], [0, -100, 100, 0]);
    return m4.yRotate(matrix, rotations[1]);
  }

  loadGUI();

  function render() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 800;
    let radius = 200;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix using look at.
    let cameraPosition = [camera.cameraX, camera.cameraY, camera.cameraZ];
    let target = [camera.cameraX + camera.rotateCamera, camera.cameraY, camera.cameraZ - 100];
    if(camera.lookCenter) { target = [0, 0, 0] }
    let up = [false, true, false];
    let cameraMatrix = m4.lookAt(cameraPosition, target, up);
    if(camera.rotateCenter) {
      cameraMatrix = m4.yRotation(degToRad(camera.rotateCamera));
      cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);
    }

    // Make a view matrix from the camera matrix.
    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    const rotations = [config.rotateX, config.rotateY, config.rotateZ]
    const translations = [config.translateX, config.translateY, config.translateZ]
    const scalings = [config.scaleX, config.scaleY, config.scaleZ]

    objects.forEach(function(object) {
      object.uniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        object.translation,
        rotations,
        translations,
        scalings
      )
    })

    let lastUsedProgramInfo = null;
    let lastUsedVertexArray = null;

    objectsToDraw.forEach(function(object) {
      let programInfo = object.programInfo;
      let vertexArray = object.vertexArray;

      if(programInfo !== lastUsedProgramInfo) {
        lastUsedProgramInfo = programInfo;
        gl.useProgram(programInfo.program);
      }

      if(lastUsedVertexArray !== vertexArray) {
        lastUsedVertexArray = vertexArray;
        gl.bindVertexArray(vertexArray);
      }

      twgl.setUniforms(programInfo, object.uniforms);

      twgl.drawBufferInfo(gl, object.bufferInfo);
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
