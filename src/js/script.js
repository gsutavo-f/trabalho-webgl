function main() {

  const fieldOfViewRadians = degToRad(60)
  const zNear = 1
  const zFar = 800

  loadGUI()

  function render() {
    let modelRotations = [config.rotateX, config.rotateY, config.rotateZ]
    let modelTranslations = [config.translateX, config.translateY, config.translateZ]
    let modelScalings = [config.scaleX, config.scaleY, config.scaleZ]

    twgl.resizeCanvasToDisplaySize(gl.canvas)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar)

    // Compute the camera's matrix using look at.
    let cameraPosition = [camera.cameraX, camera.cameraY, camera.cameraZ]
    let target = getTargetValue()
    let up = [false, true, false]

    let cameraMatrix = m4.lookAt(cameraPosition, target, up)
    
    cameraMatrix = rotateCameraAroundCenter(cameraMatrix)

    // Make a view matrix from the camera matrix.
    let viewMatrix = m4.inverse(cameraMatrix)

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

    objects.forEach(function(object) {
      object.uniforms.u_matrix = computeMatrix(
        viewProjectionMatrix,
        object.translation,
        modelRotations,
        modelTranslations,
        modelScalings
      )
    })

    let lastUsedProgramInfo = null
    let lastUsedVertexArray = null

    objectsToDraw.forEach(function(object) {
      let programInfo = object.programInfo
      let vertexArray = object.vertexArray

      if(programInfo !== lastUsedProgramInfo) {
        lastUsedProgramInfo = programInfo
        gl.useProgram(programInfo.program)
      }

      if(lastUsedVertexArray !== vertexArray) {
        lastUsedVertexArray = vertexArray
        gl.bindVertexArray(vertexArray)
      }

      twgl.setUniforms(programInfo, object.uniforms)

      twgl.drawBufferInfo(gl, object.bufferInfo)
    })

    requestAnimationFrame(render)
  }

  requestAnimationFrame(render)
}

main()
