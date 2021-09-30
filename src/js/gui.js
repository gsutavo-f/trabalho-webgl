let config = {
  addModel: () => {
    addMod()
  },
  removeModel: () => {
    removeMod()
  },
  rotateX: degToRad(0),
  rotateY: degToRad(0),
  rotateZ: degToRad(0),
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  curve: 0
}

let camera = {
  rotateCamera: 0,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 150,
  lookCenter: false,
  rotateCenter: false
}

const loadGUI = () => {
  const gui = new dat.GUI()

  gui.add(config, "addModel").name("Add Model")
  gui.add(config, "removeModel").name("Remove Model")

  let modFolder = gui.addFolder("Model")
  modFolder.open()

  let modFolderRotation = modFolder.addFolder("Rotation")
  modFolderRotation.open()
  modFolderRotation.add(config, "rotateX", 0, 10, 0.1).name("X")
  modFolderRotation.add(config, "rotateY", 0, 10, 0.1).name("Y")
  modFolderRotation.add(config, "rotateZ", 0, 10, 0.1).name("Z")

  let modFolderTranslation = modFolder.addFolder("Translation")
  modFolderTranslation.open()
  modFolderTranslation.add(config, "translateX", -150, 150, 0.1).name("X")
  modFolderTranslation.add(config, "translateY", -150, 150, 0.1).name("Y")
  modFolderTranslation.add(config, "translateZ", -250, 250, 0.1).name("Z")
  modFolderTranslation.add(config, "curve", -50, 50, 0.1).name("Curve")

  let modFolderScale = modFolder.addFolder("Scale")
  modFolderScale.open()
  modFolderScale.add(config, "scaleX", 1, 10, 0.1).name("X")
  modFolderScale.add(config, "scaleY", 1, 10, 0.1).name("Y")
  modFolderScale.add(config, "scaleZ", 1, 10, 0.1).name("Z")

  let cameraFolder = gui.addFolder("Camera")
  cameraFolder.open()

  cameraFolder.add(camera, "rotateCamera", -360, 360, 0.1).name("Rotate Camera")
  cameraFolder.add(camera, "cameraX", -150, 150, 0.1).name("Camera X")
  cameraFolder.add(camera, "cameraY", -150, 150, 0.1).name("Camera Y")
  cameraFolder.add(camera, "cameraZ",  1, 300, 0.1).name("Zoom")
  cameraFolder.add(camera, "lookCenter").name("Look at center")
  cameraFolder.add(camera, "rotateCenter").name("Rotate around center")
}

// functions using gui.js variables
function computeMatrix(viewProjectionMatrix, translation, rotations, translations, scalings) {
  let matrix = m4.translate(
    viewProjectionMatrix,
    translation[0],
    translation[1],
    translation[2],
  )
  matrix = m4.xRotate(matrix, rotations[0])
  matrix = m4.zRotate(matrix, rotations[2])
  matrix = m4.translate(matrix, translations[0], translations[1], translations[2])
  matrix = m4.scale(matrix, scalings[0], scalings[1], scalings[2])
  matrix = splineCurve(matrix, 50 - config.curve, [75, 0, 0, -75], [0, -100, 100, 0])
  return m4.yRotate(matrix, rotations[1])
}

function getTargetValue() {
  if(camera.lookCenter) { return [0, 0, 0] }
  return [camera.cameraX + camera.rotateCamera, camera.cameraY, camera.cameraZ - 100]
}

function rotateCameraAroundCenter(matrix) {
  let radius = 200
  
  if(camera.rotateCenter) {
    matrix = m4.yRotation(degToRad(camera.rotateCamera))
    return m4.translate(matrix, 0, 0, radius * 1.5)
  }

  return matrix
}