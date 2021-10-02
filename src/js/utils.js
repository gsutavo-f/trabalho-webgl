const { gl, meshProgramInfo } = initializeWorld()

const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6)
const cubeBufferInfo = flattenedPrimitives.createCubeBufferInfo(gl, 20)
const coneBufferInfo = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false)

const sphereVAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, sphereBufferInfo)
const cubeVAO = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, cubeBufferInfo)
const coneVAO =twgl.createVAOFromBufferInfo(gl, meshProgramInfo, coneBufferInfo)

let shapes = [
    {bufferInfo: sphereBufferInfo, vertexArray: sphereVAO },
    {bufferInfo: cubeBufferInfo, vertexArray: cubeVAO },
    {bufferInfo: coneBufferInfo, vertexArray: coneVAO }
  ]

let objectsToDraw = []
let objects = []
let baseHue = rand(360)
let numModels = 0


// FUNCTIONS
function degToRad(d) {
  return (d * Math.PI) / 180
} 

function radToDeg(r) {
  return (r * 180) / Math.PI
}

function rand(min, max) {
    if(max === undefined) {
        max = min
        min = 0
    }
    return Math.random() * (max - min) + min
}

function emod(x, n) {
  return x >= 0 ? (x % n) : ((n - (-x % n)) % n)
} 

function addMod() {
    let shape = shapes[rand(shapes.length) | 0]

    let object = {
        uniforms: {
            u_colorMult: chroma.hsv(emod(baseHue + rand(120), 360), rand(0.5, 1), rand(0.5, 1)).gl(),
            u_matrix: m4.identity(),
        },
        translation: [rand(-100, 100), rand(-100, 100), rand(-150, -50)]
    }
    objects.push(object)

    objectsToDraw.push({
        programInfo: meshProgramInfo,
        bufferInfo: shape.bufferInfo,
        vertexArray: shape.vertexArray,
        uniforms: object.uniforms
    })
    numModels++
}

function removeMod() {
    objects.pop()
    objectsToDraw.pop()
    numModels--
}

function splineCurve(matrix, translateCurve, x, y) {
  let t = translateCurve * 0.01
  let xOut = (1 - t) * ((1 - t) * ((1 - t) * x[0] + t * x[1]) + t * ((1 - t) * x[1] + t * x[2])) + t * ((1 - t) * ((1 - t) * x[1] + t * x[2]) + t * ((1 - t) * x[2] + t * x[3]))
  let yOut = (1 - t) * ((1 - t) * ((1 - t) * y[0] + t * y[1]) + t * ((1 - t) * y[1] + t * y[2])) + t * ((1 - t) * ((1 - t) * y[1] + t * y[2]) + t * ((1 - t) * y[2] + t * y[3]))
  
  matrix = m4.translate(matrix, xOut, yOut, 0)
  
  return matrix
}