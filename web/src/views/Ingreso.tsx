// Pantalla de ingreso: usuario y contraseña.

import { useState } from 'react';
import { Girador } from '../components/Basicos';
import { URL_COMPILADA, guardarAjustes, leerAjustes, urlValida } from '../lib/ajustes';
import { iniciarSesion, mensaje } from '../lib/api';

export function Ingreso() {
  const previo = leerAjustes();
  const [usuario, setUsuario] = useState(previo.usuario);
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [url, setUrl] = useState(previo.url || URL_COMPILADA);
  const [verServidor, setVerServidor] = useState(!URL_COMPILADA && !previo.url);
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState('');
  const sinSenal = !navigator.onLine;

  const entrar = async () => {
    setError('');
    if (!urlValida(url)) {
      setVerServidor(true);
      setError('Falta la dirección del servidor.');
      return;
    }
    setEntrando(true);
    try {
      await iniciarSesion(usuario, clave, url);
    } catch (e) {
      setError(mensaje(e));
      setClave('');
    } finally {
      setEntrando(false);
    }
  };

  return (
    <div className="pagina" style={{ maxWidth: 420, paddingTop: 32 }}>
      <form
        className="tarjeta pila"
        onSubmit={(e) => {
          e.preventDefault();
          void entrar();
        }}
      >
        <div className="pila" style={{ gap: 4, textAlign: 'center' }}>
          <img src="./icon-192.png" alt="" width={64} height={64} style={{ margin: '0 auto', borderRadius: 14 }} />
          <h1 className="titulo-pagina">Historia clínica</h1>
          <span className="sub">FMH · UNA Puno</span>
        </div>

        <label className="campo-ajuste">
          Usuario
          <input
            autoFocus={!usuario}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <label className="campo-ajuste">
          Contraseña
          <div className="fila" style={{ flexWrap: 'nowrap' }}>
            <input
              autoFocus={!!usuario}
              type={verClave ? 'text' : 'password'}
              autoComplete="current-password"
              style={{ flex: 1 }}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
            />
            <button type="button" className="boton chico" onClick={() => setVerClave(!verClave)}>
              {verClave ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </label>

        {verServidor ? (
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
        ) : (
          <button type="button" className="boton chico" style={{ justifySelf: 'start' }} onClick={() => setVerServidor(true)}>
            Cambiar servidor
          </button>
        )}

        {sinSenal && <div className="aviso-texto">Sin señal. Para ingresar la primera vez necesitas conexión.</div>}
        {error && <div className="error-texto">{error}</div>}

        <button type="submit" className="boton primario bloque" disabled={entrando || !usuario.trim() || !clave || sinSenal}>
          {entrando ? <Girador /> : null} Ingresar
        </button>

        <p className="sub pequeno" style={{ margin: 0 }}>
          La sesión dura 30 días en este dispositivo y funciona aunque no haya señal. Al entrar crearás un PIN que protege las historias guardadas aquí.
        </p>
      </form>

      <button
        type="button"
        className="boton bloque"
        style={{ marginTop: 12, background: 'transparent' }}
        onClick={() => guardarAjustes({ soloLocal: true })}
      >
        Usar sin servidor (solo en este dispositivo)
      </button>
    </div>
  );
}
