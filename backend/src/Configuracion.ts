// Página de configuración para el dueño del script (sin abrir el editor):
// abre https://script.google.com/macros/s/<ID DEL SCRIPT>/dev con tu cuenta de Google.
// Crea la hoja la primera vez, muestra el usuario y la contraseña temporal y guarda la clave de Gemini.
// A cualquier otra persona (la app, un curioso) doGet solo le responde que el servidor está activo.

import { geminiConfigurado, llamarGemini, modelo } from './Gemini';
import { PROPS, prop, setProp } from './Util';
import { setup } from './Setup';

declare const SEMILLA_VERSION: string;

function esDueno(): boolean {
  try {
    const activo = Session.getActiveUser().getEmail();
    const dueno = Session.getEffectiveUser().getEmail();
    return !!activo && activo === dueno;
  } catch {
    return false;
  }
}

function escapar(t: string): string {
  return t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function doGet(): GoogleAppsScript.Content.TextOutput | GoogleAppsScript.HTML.HtmlOutput {
  if (!esDueno()) return ContentService.createTextOutput('HC App: servidor activo.');
  const info = setup();
  const temporal = prop(PROPS.CLAVE_INICIAL);
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font:16px system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;color:#14262b}
h1{font-size:1.4rem;color:#0f5f6b}.ok{color:#1d7a46}.falta{color:#b42318}
.caja{border:1px solid #d6e0e2;border-radius:12px;padding:14px;margin:12px 0}
input{width:100%;padding:10px;font:inherit;box-sizing:border-box;margin:6px 0}
button{padding:10px 16px;font:inherit;border-radius:10px;border:0;background:#0f5f6b;color:#fff;cursor:pointer}
code{background:#eef3f4;padding:2px 6px;border-radius:6px;word-break:break-all}
</style>
<h1>HC App · configuración del servidor</h1>
<div class="caja">
  <p class="ok">✓ Hoja de datos y carpeta listas.</p>
  <p>Hoja (privada, no la compartas): <a href="${escapar(info.hoja)}" target="_blank">abrir</a></p>
  <p>Usuario de la app: <code>${escapar(info.usuario)}</code></p>
  ${
    temporal
      ? `<p>Contraseña temporal: <code>${escapar(temporal)}</code><br>Entra a la app con ella y cámbiala en Ajustes: después ya no se muestra aquí.</p>`
      : '<p>La contraseña ya fue cambiada. Si la olvidaste, ejecuta <code>restablecerClave</code> en el editor.</p>'
  }
  <p>Versión de semillas: <code>${escapar(SEMILLA_VERSION)}</code> · Modelo: <code>${escapar(modelo())}</code></p>
</div>
<div class="caja">
  <p id="estado" class="${geminiConfigurado() ? 'ok' : 'falta'}">${geminiConfigurado() ? '✓ Clave de Gemini guardada.' : '✗ Falta la clave de Gemini.'}</p>
  <p>Pega tu clave de <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a> (solo queda en este servidor; el navegador nunca la ve):</p>
  <input id="clave" type="password" autocomplete="off" placeholder="Clave de Gemini">
  <button onclick="guardar()">Guardar y probar</button>
  <p id="resultado"></p>
</div>
<script>
function guardar(){
  var r=document.getElementById('resultado');
  r.textContent='Probando…';
  google.script.run
    .withSuccessHandler(function(t){r.textContent='✓ '+t;document.getElementById('estado').textContent='✓ Clave de Gemini guardada.';document.getElementById('estado').className='ok';document.getElementById('clave').value='';})
    .withFailureHandler(function(e){r.textContent='✗ '+e.message;})
    .guardarClaveGemini(document.getElementById('clave').value);
}
</script>`;
  return HtmlService.createHtmlOutput(html).setTitle('HC App · configuración');
}

/** Lo llama la página de configuración. Solo el dueño puede cambiar la clave. */
export function guardarClaveGemini(clave: string): string {
  if (!esDueno()) throw new Error('Solo el dueño del script puede cambiar la clave');
  const k = String(clave ?? '').trim();
  if (k.length < 20 || /\s/.test(k)) throw new Error('La clave no tiene el formato esperado');
  const anterior = prop(PROPS.API_KEY_GEMINI);
  setProp(PROPS.API_KEY_GEMINI, k);
  try {
    const r = llamarGemini({ partes: [{ type: 'text', text: 'Responde solo: listo' }], pensamiento: 'low', maxTokens: 50 });
    return `Gemini respondió: ${r.trim().slice(0, 40)}`;
  } catch (e) {
    setProp(PROPS.API_KEY_GEMINI, anterior);
    throw new Error(`La clave no funcionó y no se guardó: ${e instanceof Error ? e.message : String(e)}`);
  }
}
