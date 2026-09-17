import { useLiveQuery } from 'dexie-react-hooks';
import { Suspense, lazy } from 'react';
import { Avisos } from './components/Basicos';
import { hayBackend, necesitaIngreso, useAjustes } from './lib/ajustes';
import { db } from './lib/db';
import { bloquear, useSeguridad } from './lib/seguridad';
import { rutas, useRuta } from './lib/router';
import { sincronizar, useEstadoSync } from './lib/sync';
import { Ajustes } from './views/Ajustes';
import { CrearPin, Desbloquear } from './views/Bloqueo';
import { Historia } from './views/Historia';
import { Historias } from './views/Historias';
import { Ingreso } from './views/Ingreso';
import { Revisar } from './views/Revisar';
import { Laboratorio } from './views/Laboratorio';
import { Seguimiento } from './views/Seguimiento';
import { VistaPrevia } from './views/VistaPrevia';

// Consulta se carga aparte (trae toda la revisión); el service worker la guarda igual para usarla sin señal.
const Consulta = lazy(() => import('./views/Consulta'));

function EstadoSync() {
  const s = useEstadoSync();
  useAjustes();
  const backend = hayBackend();
  const pendientes = useLiveQuery(async () => {
    const [ops, entradas, historias] = await Promise.all([
      db.ops.count(),
      db.entradas.where('estado').equals('pendiente').count(),
      db.historias.filter((h) => h.sucio.length > 0 || h.estadoSucio).count(),
    ]);
    return ops + entradas + historias;
  }, []);

  let clase = 'punto';
  let texto = 'Al día';
  if (!backend) {
    clase += ' apagado';
    texto = 'Solo local';
  } else if (!s.enLinea) {
    clase += ' apagado';
    texto = pendientes ? `Sin señal · ${pendientes} en cola` : 'Sin señal';
  } else if (s.sincronizando) {
    clase += ' pendiente girando';
    texto = 'Sincronizando';
  } else if (s.error) {
    clase += ' error';
    texto = 'Error';
  } else if (pendientes) {
    clase += ' pendiente';
    texto = `${pendientes} por subir`;
  }

  return (
    <button
      type="button"
      className="estado-sync"
      style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}
      title={s.error || texto}
      onClick={() => (backend ? void sincronizar() : (location.hash = rutas.ajustes()))}
    >
      <span className={clase} />
      {texto}
    </button>
  );
}

export function App() {
  const ruta = useRuta();
  const ajustes = useAjustes();
  const seguridad = useSeguridad();

  if (seguridad.bloqueada) {
    return (
      <>
        <header className="barra">
          <span className="marca">HC · UNA Puno</span>
        </header>
        <Desbloquear />
        <Avisos />
      </>
    );
  }

  if (necesitaIngreso(ajustes)) {
    return (
      <>
        <header className="barra">
          <span className="marca">HC · UNA Puno</span>
        </header>
        <Ingreso />
        <Avisos />
      </>
    );
  }

  // Con servidor en internet, las historias del dispositivo se protegen con PIN antes de usarlas.
  if (!seguridad.activa && !ajustes.soloLocal) {
    return (
      <>
        <header className="barra">
          <span className="marca">HC · UNA Puno</span>
        </header>
        <CrearPin />
        <Avisos />
      </>
    );
  }

  let vista;
  switch (ruta.vista) {
    case 'historia':
      vista = <Historia clave={ruta.clave} seccion={ruta.seccion} campo={ruta.campo} />;
      break;
    case 'revisar':
      vista = <Revisar clave={ruta.clave} />;
      break;
    case 'previa':
      vista = <VistaPrevia clave={ruta.clave} />;
      break;
    case 'seguimiento':
      vista = <Seguimiento clave={ruta.clave} />;
      break;
    case 'laboratorio':
      vista = <Laboratorio clave={ruta.clave} />;
      break;
    case 'ajustes':
      vista = <Ajustes />;
      break;
    case 'consulta':
      vista = (
        <Suspense fallback={<div className="pagina vacio">Cargando…</div>}>
          <Consulta key={`${ruta.q}|${ruta.grupo}`} q={ruta.q} grupo={ruta.grupo} />
        </Suspense>
      );
      break;
    default:
      vista = <Historias />;
  }
  return (
    <>
      <header className="barra">
        <a className="marca" href={rutas.historias()}>
          HC · UNA Puno
        </a>
        <span className="espacio" />
        <EstadoSync />
        {seguridad.activa && (
          <button type="button" className="icono" aria-label="Bloquear" title="Bloquear ahora" onClick={bloquear}>
            🔒
          </button>
        )}
        <a className="icono" href={rutas.consulta()} aria-label="Consulta" title="Consulta: escalas, valores normales y definiciones">
          📚
        </a>
        <a className="icono" href={rutas.ajustes()} aria-label="Ajustes">
          ⚙
        </a>
      </header>
      {vista}
      <Avisos />
    </>
  );
}
