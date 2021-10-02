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

let animations = {
  playAnimation: () => {
    requestAnimationFrame(animateObj)
  },
  whatAnimate: "Models",
  animationType: "Rotation",
  directionOption: "Positive",
  animationValue: 0
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

  let animationsFolder = gui.addFolder("Animations")
  animationsFolder.open()
  animationsFolder.add(animations, "whatAnimate", ["Models", "Camera"]).name("What animate")
  animationsFolder.add(animations, "animationType", ["Rotation", "Translation"]).name("Animation Type")
  animationsFolder.add(animations, "directionOption", ["Positive", "Negative"]).name("Direction")
  animationsFolder.add(animations, "animationValue", 0, 600, 10).name("Time")
  animationsFolder.add(animations, "playAnimation").name("Play")

}

// functions using gui.js variables
function computeMatrix(viewProjectionMatrix, translation) {
  let matrix = m4.translate(
    viewProjectionMatrix,
    translation[0],
    translation[1],
    translation[2],
  )
  return matrix
}

function computeLastModel(model, rotations, translations, scalings) {
  model = m4.xRotate(model, rotations[0])
  model = m4.zRotate(model, rotations[2])
  model = m4.translate(model, translations[0], translations[1], translations[2])
  model = m4.scale(model, scalings[0], scalings[1], scalings[2])
  model = splineCurve(model, 50 - config.curve, [75, 0, 0, -75], [0, -100, 100, 0])
  return m4.yRotate(model, rotations[1])
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

function animateObj(now) {
  now *= 0.001
  let then = now
  let rotationTime = animations.animationValue
  let translationTime = animations.animationValue
  let animationSpeed = 10

  if(animations.whatAnimate == "Models") {
    if(animations.animationType == "Rotation") {
      const animateRotation = (now) => {
        now *= 0.001
        let deltaTime = now - then
        then = now
    
        if(animations.directionOption == "Positive") {
          config.rotateX += deltaTime * animationSpeed;
          if(config.rotateX < rotationTime) {
            requestAnimationFrame(animateRotation)
          } else {
            config.rotateX = rotationTime
          }
        } else if(animations.directionOption == "Negative") {
          config.rotateX -= deltaTime * animationSpeed
          if(config.rotateX > (rotationTime * -1)) {
            requestAnimationFrame(animateRotation)
          } else {
            config.rotateX = rotationTime
          }
        }
      }
      requestAnimationFrame(animateRotation)
      config.rotateX = 0
    } else if(animations.animationType == "Translation") {
      const animateTranslation = (now) => {
        now *= 0.001
        let deltaTime = now - then
        then = now
    
        if(animations.directionOption == "Positive") {
          config.translateX += deltaTime * animationSpeed
          if(config.translateX < translationTime) {
            requestAnimationFrame(animateTranslation)
          } else {
            config.translateX = translationTime
          }
        } else if(animations.directionOption == "Negative") {
          config.translateX -= deltaTime * animationSpeed
          if(config.translateX > (translationTime * -1)) {
            requestAnimationFrame(animateTranslation)
          } else {
            config.translateX = translationTime
          }
        }
      }
      requestAnimationFrame(animateTranslation)
      config.translateX = 0
    }
  } else if(animations.whatAnimate == "Camera") {
    if(animations.animationType == "Rotation") {
      camera.rotateCenter = true
      const animateCameraRotation = (now) => {
        now *= 0.001
        let deltaTime = now - then
        then = now
    
        if(animations.directionOption == "Positive") {
          camera.rotateCamera += deltaTime * animationSpeed;
          if(camera.rotateCamera < rotationTime) {
            requestAnimationFrame(animateCameraRotation)
          } else {
            camera.rotateCamera = rotationTime
          }
        } else if(animations.directionOption == "Negative") {
          camera.rotateCamera -= deltaTime * animationSpeed
          if(camera.rotateCamera > (rotationTime * -1)) {
            requestAnimationFrame(animateCameraRotation)
          } else {
            camera.rotateCamera = rotationTime
          }
        }
      }
      requestAnimationFrame(animateCameraRotation)
      camera.rotateCamera = 0
    } else if(animations.animationType == "Translation") {
      camera.rotateCenter = false
      const animateCameraTranslation = (now) => {
        now *= 0.001
        let deltaTime = now - then
        then = now
    
        if(animations.directionOption == "Positive") {
          camera.cameraX += deltaTime * animationSpeed
          if(camera.cameraX < translationTime) {
            requestAnimationFrame(animateCameraTranslation)
          } else {
            camera.cameraX = translationTime
          }
        } else if(animations.directionOption == "Negative") {
          camera.cameraX -= deltaTime * animationSpeed
          if(camera.cameraX > (translationTime * -1)) {
            requestAnimationFrame(animateCameraTranslation)
          } else {
            camera.cameraX = translationTime
          }
        }
      }
      requestAnimationFrame(animateCameraTranslation)
      camera.cameraX = 0
    }
  }
}