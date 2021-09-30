const vertexShaderSource = `#version 300 es
  in vec4 a_position;
  in vec4 a_color;

  uniform mat4 u_matrix;

  out vec4 v_color;

  void main() {
    gl_Position = u_matrix * a_position;

    v_color = a_color;
  }
`;

const fragmentShaderSource = `#version 300 es
  precision highp float;

  in vec4 v_color;

  uniform vec4 u_colorMult;

  out vec4 outColor;

  void main() {
    outColor = v_color * u_colorMult;
  }
`;

const initializeWorld = () => {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  twgl.setAttributePrefix("a_");
  const meshProgramInfo = twgl.createProgramInfo(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  return {
    gl,
    meshProgramInfo,
  };
};
