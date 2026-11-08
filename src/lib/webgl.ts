/** Devuelve `true` si el navegador puede crear un contexto WebGL. */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");

    return Boolean(window.WebGLRenderingContext && context);
  } catch {
    return false;
  }
}
