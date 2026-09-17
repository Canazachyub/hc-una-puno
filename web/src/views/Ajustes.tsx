// Cuenta, servidor, estado de la sincronización y datos locales.

import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import type { PingRespuesta } from '../../../shared/types';
import { Girador } from '../components/Basicos';
import { CrearPin } from './Bloqueo';
import { esUrlCompilada, guardarAjustes, hayBackend, resolverUrl, urlServidor, urlValida, useAjustes } from '../lib/ajustes';
import { avisar } from '../lib/avisos';
import { cambiarClave, cerrarSesion, llamar, mensaje } from '../lib/api';
import { db } from '../lib/db';
import { actualizarCatalogos, useCatalogo } from '../lib/schema';
import { activarHuella, bloquear, cambiarPin, desactivar, fijarMinutos, huellaPosible, quitarHuella, useSeguridad } from '../lib/seguridad';
import { refrescarRemotas, sincronizar, useEstadoSync } from '../lib/sync';

function Cuenta({ pendientes }: { pendientes: number }) {
  const a = useAjustes();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [usuarioNuevo, setUsuarioNuevo] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  if (a.soloLocal) {
    return (
      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Cuenta</h2>
        <span className="sub">Estás usando la app sin servidor: las historias quedan solo en este dispositivo y Gemini no está disponible.</span>
        <button type="button" className="boton primario" style={{ justifySelf: 'start' }} onClick={() => guardarAjustes({ soloLocal: false })}>
          Ingresar con usuario y contraseña
        </button>
      </section>
    );
  }

  const cambiar = async () => {
    setError('');
    if (nueva !== repetir) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    setGuardando(true);
    try {
      await cambiarClave(actual, nueva, usuarioNuevo);
      avisar('Contraseña actualizada. Las demás sesiones se cerraron.', 'exito');
      setActual('');
      setNueva('');
      setRepetir('');
      setUsuarioNuevo('');
      setAbierto(false);
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setGuardando(false);
    }
  };

  const salir = async () => {
    const aviso = pendientes
      ? `Hay ${pendientes} cambios sin subir: se subirán cuando vuelvas a ingresar. ¿Cerrar sesión?`
      : 'Las historias siguen guardadas en este dispositivo. ¿Cerrar sesión?';
    if (!confirm(aviso)) return;
    await cerrarSesion();
  };

  return (
    <section className="tarjeta pila">
      <div className="fila entre">
        <div>
          <h2 style={{ fontSize: '1rem' }}>Cuenta</h2>
          <span className="sub">Usuario: {a.usuario || '—'}</span>
        </div>
        <button type="button" className="boton peligro chico" onClick={() => void salir()}>
          Cerrar sesión
        </button>
      </div>
      {!abierto ? (
        <button type="button" className="boton" style={{ justifySelf: 'start' }} onClick={() => setAbierto(true)}>
          Cambiar usuario o contraseña
        </button>
      ) : (
        <form
          className="pila"
          onSubmit={(e) => {
            e.preventDefault();
            void cambiar();
          }}
        >
          <label className="campo-ajuste">
            Contraseña actual
            <input type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} />
          </label>
          <label className="campo-ajuste">
            Contraseña nueva (mínimo 8)
            <input type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
          </label>
          <label className="campo-ajuste">
            Repite la contraseña nueva
            <input type="password" autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} />
          </label>
          <label className="campo-ajuste">
            Usuario nuevo (opcional)
            <input
              autoComplete="username"
              autoCapitalize="none"
              placeholder={a.usuario}
              value={usuarioNuevo}
              onChange={(e) => setUsuarioNuevo(e.target.value)}
            />
          </label>
          {error && <div className="error-texto">{error}</div>}
          <div className="fila">
            <button type="submit" className="boton primario" disabled={guardando || !actual || nueva.length < 8 || !navigator.onLine}>
              {guardando ? <Girador /> : null} Guardar
            </button>
            <button type="button" className="boton" onClick={() => setAbierto(false)}>
              Cancelar
            </button>
          </div>
          {!navigator.onLine && <span className="sub">Necesitas señal para cambiar la contraseña.</span>}
        </form>
      )}
    </section>
  );
}

function Seguridad() {
  const seg = useSeguridad();
  const a = useAjustes();
  const [actual, setActual] = useState('');
  const [nuevo, setNuevo] = useState('');
  const [ocupado, setOcupado] = useState('');
  const [huella, setHuella] = useState(false);

  useEffect(() => {
    void huellaPosible().then(setHuella);
  }, []);

  if (!seg.activa) {
    return (
      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Seguridad</h2>
        <span className="sub">Sin PIN: las historias de este dispositivo no están cifradas.</span>
        <CrearPin />
      </section>
    );
  }

  const hacer = async (clave: string, fn: () => Promise<unknown>, ok: string) => {
    setOcupado(clave);
    try {
      await fn();
      avisar(ok, 'exito');
      setActual('');
      setNuevo('');
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setOcupado('');
    }
  };

  return (
    <section className="tarjeta pila">
      <h2 style={{ fontSize: '1rem' }}>Seguridad</h2>
      <span className="insignia sem sem-0" style={{ justifySelf: 'start' }}>
        🔐 Historias cifradas en este dispositivo
      </span>
      <label className="campo-ajuste">
        Bloquear tras minutos sin uso
        <select value={seg.minutos} onChange={(e) => fijarMinutos(Number(e.target.value))}>
          {[1, 2, 5, 10, 15, 30].map((m) => (
            <option key={m} value={m}>
              {m} {m === 1 ? 'minuto' : 'minutos'}
            </option>
          ))}
        </select>
      </label>
      <span className="sub pequeno">También se bloquea si sales de la app por más de un minuto.</span>
      <label className="campo-ajuste">
        PIN actual
        <input type="password" inputMode="numeric" autoComplete="off" value={actual} onChange={(e) => setActual(e.target.value.replace(/\D/g, ''))} />
      </label>
      <label className="campo-ajuste">
        PIN nuevo
        <input type="password" inputMode="numeric" autoComplete="off" value={nuevo} onChange={(e) => setNuevo(e.target.value.replace(/\D/g, ''))} />
      </label>
      <div className="fila">
        <button type="button" className="boton" disabled={!actual || !nuevo || !!ocupado} onClick={() => void hacer('pin', () => cambiarPin(actual, nuevo), 'PIN cambiado')}>
          {ocupado === 'pin' ? <Girador /> : null} Cambiar PIN
        </button>
        {huella && !seg.huella && (
          <button type="button" className="boton" disabled={!actual || !!ocupado} onClick={() => void hacer('huella', () => activarHuella(actual, a.usuario), 'Huella activada')}>
            {ocupado === 'huella' ? <Girador /> : '👆'} Activar huella (con el PIN actual)
          </button>
        )}
        {seg.huella && (
          <button type="button" className="boton" onClick={() => { quitarHuella(); avisar('Huella desactivada'); }}>
            Quitar huella
          </button>
        )}
      </div>
      <div className="fila">
        <button type="button" className="boton" onClick={bloquear}>
          🔒 Bloquear ahora
        </button>
        {a.soloLocal && (
          <button
            type="button"
            className="boton peligro"
            disabled={!actual || !!ocupado}
            onClick={() => void hacer('quitar', () => desactivar(actual), 'PIN quitado: los datos quedan sin cifrar')}
          >
            Quitar PIN
          </button>
        )}
      </div>
    </section>
  );
}

export function Ajustes() {
  const cat = useCatalogo();
  const sync = useEstadoSync();
  const a = useAjustes();
  const [nombre, setNombre] = useState(a.nombre);
  const [altitud, setAltitud] = useState(String(a.altitud));
  const [url, setUrl] = useState(urlServidor());
  const [probando, setProbando] = useState(false);
  const [ping, setPing] = useState<PingRespuesta | null>(null);
  const [trabajando, setTrabajando] = useState('');
  const ops = useLiveQuery(() => db.ops.toArray(), []);
  const entradas = useLiveQuery(() => db.entradas.toArray(), []);
  const historias = useLiveQuery(() => db.historias.toArray(), []);
  const sucias = (historias ?? []).filter((h) => h.sucio.length > 0 || h.estadoSucio || h.version === 0).length;
  const pendientes = (ops?.length ?? 0) + (entradas?.filter((e) => e.estado !== 'transcrita').length ?? 0) + sucias;
  const backend = hayBackend();

  const guardarServidor = () => {
    if (url.trim() && !urlValida(url)) {
      avisar('Escribe una dirección que empiece con http:// o https://', 'error');
      return;
    }
    const cambio = resolverUrl(url) !== urlServidor();
    // Otro servidor, otra cuenta: hay que volver a ingresar.
    guardarAjustes({ url: esUrlCompilada(url) ? '' : resolverUrl(url), ...(cambio ? { token: '' } : {}) });
    avisar(cambio ? 'Servidor cambiado. Ingresa de nuevo.' : 'Guardado', 'exito');
  };

  const probar = async () => {
    setProbando(true);
    setPing(null);
    try {
      setPing(await llamar('ping', {}, { timeoutMs: 30_000 }));
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setProbando(false);
    }
  };

  const hacer = async (clave: string, fn: () => Promise<unknown>, ok: string) => {
    setTrabajando(clave);
    try {
      await fn();
      avisar(ok, 'exito');
    } catch (e) {
      avisar(mensaje(e), 'error');
    } finally {
      setTrabajando('');
    }
  };

  const borrarTodo = async () => {
    const texto = pendientes
      ? `Hay ${pendientes} cambios sin subir que se perderán. ¿Borrar todos los datos de este dispositivo?`
      : 'Se borrarán las historias de este dispositivo (la nube las conserva). ¿Continuar?';
    if (!confirm(texto)) return;
    await Promise.all([db.historias.clear(), db.ops.clear(), db.entradas.clear(), db.remotas.clear()]);
    avisar('Datos locales borrados');
  };

  return (
    <div className="pagina pila" style={{ maxWidth: 720 }}>
      <h1 className="titulo-pagina">Ajustes</h1>

      <Cuenta pendientes={pendientes} />

      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Tus datos</h2>
        <label className="campo-ajuste">
          Tu nombre (para «Elaborado por»)
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => guardarAjustes({ nombre })} />
        </label>
        <label className="campo-ajuste">
          Altitud donde atiendes (metros sobre el nivel del mar)
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={6000}
            value={altitud}
            onChange={(e) => setAltitud(e.target.value)}
            onBlur={() => {
              const n = Number(altitud);
              if (Number.isFinite(n) && n >= 0 && n <= 6000) guardarAjustes({ altitud: Math.round(n) });
              else setAltitud(String(a.altitud));
            }}
          />
        </label>
        <span className="sub pequeno">
          Puno está a 3 827 m. Con 2 500 m o más, la saturación de oxígeno y la hemoglobina se interpretan con los rangos de altura.
        </span>
      </section>

      <Seguridad />

      {!a.soloLocal && (
        <section className="tarjeta pila">
          <h2 style={{ fontSize: '1rem' }}>Servidor</h2>
          <label className="campo-ajuste">
            Dirección del servidor
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="http://192.168.0.19:8787/api"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <div className="fila">
            <button type="button" className="boton" onClick={guardarServidor} disabled={resolverUrl(url) === urlServidor()}>
              Guardar dirección
            </button>
            <button type="button" className="boton" disabled={probando || !backend} onClick={() => void probar()}>
              {probando ? <Girador /> : null} Probar conexión
            </button>
          </div>
          {ping && (
            <div className={ping.gemini ? 'resultado' : 'aviso-texto'}>
              Conectado. Modelo: {ping.modelo}. {ping.gemini ? 'Gemini configurado.' : 'Falta la API key de Gemini en el servidor.'}
            </div>
          )}
          <p className="sub pequeno" style={{ margin: 0 }}>
            La API key de Gemini vive solo en el servidor; nunca pasa por el teléfono.
          </p>
        </section>
      )}

      {backend && (
        <section className="tarjeta pila">
          <h2 style={{ fontSize: '1rem' }}>Sincronización</h2>
          <div className="fila">
            <span className="insignia">{ops?.length ?? 0} guardados en cola</span>
            <span className="insignia">{entradas?.filter((e) => e.estado !== 'transcrita').length ?? 0} entradas de voz o texto en cola</span>
            <span className="insignia">{sucias} historias con cambios</span>
          </div>
          {sync.ultimo && <span className="sub">Última sincronización: {new Date(sync.ultimo).toLocaleString()}</span>}
          {sync.error && <div className="error-texto">{sync.error}</div>}
          {(ops ?? [])
            .filter((o) => o.error)
            .map((o) => (
              <div key={o.opId} className="error-texto pequeno">
                {o.clave}: {o.error} (intento {o.intentos})
              </div>
            ))}
          <div className="fila">
            <button type="button" className="boton" disabled={!!trabajando} onClick={() => void hacer('sync', sincronizar, 'Sincronizado')}>
              {trabajando === 'sync' ? <Girador /> : '⟳'} Sincronizar ahora
            </button>
            <button type="button" className="boton" disabled={!!trabajando} onClick={() => void hacer('cat', actualizarCatalogos, 'Catálogos al día')}>
              {trabajando === 'cat' ? <Girador /> : null} Actualizar esquema y opciones
            </button>
            <button type="button" className="boton" disabled={!!trabajando} onClick={() => void hacer('lista', refrescarRemotas, 'Lista de la nube actualizada')}>
              {trabajando === 'lista' ? <Girador /> : null} Traer lista de la nube
            </button>
          </div>
        </section>
      )}

      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Catálogos</h2>
        <span className="sub">
          Versión {cat.version} · {cat.esquema.length} campos · {cat.listas.size} listas · {cat.knowledge.length} fragmentos de tus notas de Semiología
        </span>
      </section>

      <section className="tarjeta pila">
        <h2 style={{ fontSize: '1rem' }}>Este dispositivo</h2>
        <span className="sub">{historias?.length ?? 0} historias guardadas aquí.</span>
        <button type="button" className="boton peligro" style={{ justifySelf: 'start' }} onClick={() => void borrarTodo()}>
          Borrar datos de este dispositivo
        </button>
      </section>
    </div>
  );
}
