uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Add a simple vignette effect
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  color.rgb *= smoothstep(0.8, 0.2, dist);

  // Add a subtle color shift based on time
  float r = color.r + 0.1 * sin(time);
  float g = color.g + 0.1 * cos(time * 0.7);
  float b = color.b + 0.1 * sin(time * 1.3);
  
  gl_FragColor = vec4(r, g, b, color.a);
}