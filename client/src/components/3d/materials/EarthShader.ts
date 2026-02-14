import { Color } from 'three'

// Custom Earth Shader for "Wow" factor atmosphere
const EarthMaterial = {
    uniforms: {
        globetexture: { value: null },
        sunDirection: { value: new Float32Array([1, 0, 0]) }, // Directional light vector
        atmosphereColor: { value: new Color('#3a75c4') }, // Glow color
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D globetexture;
    uniform vec3 sunDirection;
    uniform vec3 atmosphereColor;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Base texture color
      vec3 color = texture2D(globetexture, vUv).rgb;
      
      // Simple day/night cycle logic could go here based on Light direction
      // For now, just basic texturing + atmosphere fresnel
      
      // Fresnel Effect for Atmosphere
      vec3 viewDirection = normalize(-vPosition);
      float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
      
      // Mix atmosphere color
      vec3 finalColor = mix(color, atmosphereColor, fresnel * 0.5);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

export { EarthMaterial }
