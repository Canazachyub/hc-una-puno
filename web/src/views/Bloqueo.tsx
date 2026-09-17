// Pantallas de seguridad: desbloquear (PIN o huella) y crear el PIN la primera vez.

import { useEffect, useState } from 'react';
import { Girador } from '../components/Basicos';
import { avisar } from '../lib/avisos';
import { leerAjustes } from '../lib/ajustes';
import { mensaje } from '../lib/api';
import {
  activarHuella,
  crearPin,
  desbloquearConHuella,
  desbloquearConPin,
  huellaPosible,
  olvidarPin,
  pinValido,
  useSeguridad,
} from '../lib/seguridad';

function CampoPin({ valor, cambiar, etiqueta, autoFocus = false }: { valor: string; cambiar: (v: string) => void; etiqueta: string; autoFocus?: boolean }) {
  return (
    <label className="pila" style={{ gap: 4 }}>
      <span className="sub">{etiqueta}</span>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={12}
        autoFocus={autoFocus}
        className="entrada-pin"
        value={valor}
        onChange={(e) => cambiar(e.target.value.replace(/\D/g, ''))}
      />
    </label>
  );
}

export function Desbloquear() {
  const s = useSeguridad();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [ahora, setAhora] = useState(Date.now());
  const espera = Math.max(0, Math.ceil((s.esperarHasta - ahora) / 1000));

  useEffect(() => {
    if (!espera) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [espera]);

  const conHuella = async () => {
    setError('');
    if (!(await desbloquearConHuella())) setError('No se pudo desbloquear con la huella. Usa tu PIN.');
  };

  useEffect(() => {
    // Con huella registrada, se ofrece al abrir.
    if (s.huella) void conHuella();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || espera) return;
    setOcupado(true);
    setError('');
    const ok = await desbloquearConPin(pin);
    setOcupado(false);
    setPin('');
    if (!ok) setError('PIN incorrecto.');
  };

  const olvide = async () => {
    if (!confirm('Se borrarán las historias de este dispositivo (lo que no se subió se pierde) y tendrás que volver a ingresar con tu usuario y contraseña. ¿Continuar?')) return;
    await olvidarPin();
    avisar('Datos del dispositivo borrados. Ingresa de nuevo.');
  };

  return (
    <div className="pagina" style={{ maxWidth: 420 }}>
      <form className="tarjeta pila" onSubmit={(e) => void entrar(e)}>
        <h1 className="titulo-pagina">🔒 App bloqueada</h1>
        <p className="sub" style={{ margin: 0 }}>
          Las historias de este dispositivo están cifradas. Ingresa tu PIN para abrirlas.
        </p>
        <CampoPin valor={pin} cambiar={setPin} etiqueta="PIN" autoFocus={!s.huella} />
        {espera > 0 && <div className="aviso-texto">Demasiados intentos. Espera {espera} segundos.</div>}
        {error && <div className="error-texto">{error}</div>}
        <button type="submit" className="boton primario" disabled={ocupado || !pin || espera > 0}>
          {ocupado ? <Girador /> : null} Desbloquear
        </button>
        {s.huella && (
          <button type="button" className="boton" onClick={() => void conHuella()}>
            👆 Usar huella o rostro
          </button>
        )}
        {s.fallos >= 3 && (
          <button type="button" className="enlace" onClick={() => void olvide()}>
            Olvidé mi PIN
          </button>
        )}
      </form>
    </div>
  );
}

export function CrearPin() {
  const [pin, setPin] = useState('');
  const [otra, setOtra] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [huella, setHuella] = useState(false);
  const [usarHuella, setUsarHuella] = useState(true);

  useEffect(() => {
    void huellaPosible().then(setHuella);
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalido = pinValido(pin);
    if (invalido) return setError(invalido);
    if (pin !== otra) return setError('Los dos PIN no coinciden.');
    setOcupado(true);
    setError('');
    try {
      await crearPin(pin);
      if (huella && usarHuella) {
        try {
          await activarHuella(pin, leerAjustes().usuario);
          avisar('PIN y huella listos', 'exito');
        } catch (err) {
          avisar(`PIN listo. La huella no se pudo activar: ${mensaje(err)}`);
        }
      } else {
        avisar('PIN listo: las historias quedan cifradas en este dispositivo', 'exito');
      }
    } catch (err) {
      setError(mensaje(err));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="pagina" style={{ maxWidth: 460 }}>
      <form className="tarjeta pila" onSubmit={(e) => void crear(e)}>
        <h1 className="titulo-pagina">🔐 Protege las historias</h1>
        <p className="sub" style={{ margin: 0 }}>
          La app funciona en internet y guarda datos de pacientes en este dispositivo. Crea un PIN de 6 a 12 números: con él se cifran las
          historias guardadas aquí y la app se bloquea sola a los 5 minutos sin uso o al salir de ella.
        </p>
        <CampoPin valor={pin} cambiar={setPin} etiqueta="PIN nuevo" autoFocus />
        <CampoPin valor={otra} cambiar={setOtra} etiqueta="Repite el PIN" />
        {huella && (
          <label className="fila">
            <input type="checkbox" checked={usarHuella} onChange={(e) => setUsarHuella(e.target.checked)} />
            <span>Desbloquear también con huella o rostro</span>
          </label>
        )}
        {error && <div className="error-texto">{error}</div>}
        <button type="submit" className="boton primario" disabled={ocupado}>
          {ocupado ? <Girador /> : null} Crear PIN y cifrar
        </button>
        <p className="sub pequeno" style={{ margin: 0 }}>
          Si olvidas el PIN, se borran los datos de este dispositivo y los vuelves a traer del servidor con tu usuario y contraseña.
        </p>
      </form>
    </div>
  );
}
