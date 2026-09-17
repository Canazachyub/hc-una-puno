// Tipos compartidos por el navegador y Apps Script. Mandan en las dos capas.

export const TIPOS_CAMPO = [
  'opcion',
  'opcion_otro',
  'multi',
  'escala',
  'texto',
  'texto_largo',
  'narrativa',
  'lista',
  'numero',
  'fecha',
  'calculado',
] as const;
export type TipoCampo = (typeof TIPOS_CAMPO)[number];

export const TIPOS_OPCION = ['opcion', 'escala', 'frase'] as const;
export type TipoOpcion = (typeof TIPOS_OPCION)[number];

/** Una fila de la hoja `Esquema`. */
export interface Campo {
  campo_id: string;
  seccion: string;
  orden: number;
  label: string;
  tipo: TipoCampo;
  obligatorio: boolean;
  lista_id: string;
  valor_normal: string;
  reglas: string[];
  ayuda_kb: string;
}

/** Una fila de la hoja `Opciones`. */
export interface Opcion {
  lista_id: string;
  nombre: string;
  tipo: TipoOpcion;
  orden: number;
  valor: string;
  etiqueta: string;
  formato_salida: string;
}

/** Una fila de la hoja `Knowledge`. */
export interface KnowledgeFila {
  id: string;
  seccion: string;
  titulo: string;
  contenido: string;
  origen_archivo: string;
}
export type KnowledgeIndice = Omit<KnowledgeFila, 'contenido'>;

export interface Catalogos {
  version: string;
  esquema: Campo[];
  opciones: Opcion[];
  knowledge: KnowledgeIndice[];
}

/** Columnas de control de la hoja `HC`, antes de los campos. */
export const COLUMNAS_CONTROL = [
  'dni',
  'episodio',
  'estado',
  'completitud',
  'version',
  'esquema_version',
  'creado_en',
  'actualizado_en',
] as const;
export type ColumnaControl = (typeof COLUMNAS_CONTROL)[number];

export const COLUMNAS_REGISTRO = [
  'id',
  'tipo',
  'dni',
  'episodio',
  'seccion',
  'campo_id',
  'contenido',
  'estado',
  'fecha',
] as const;
export type TipoRegistro = 'entrada' | 'audio' | 'imagen' | 'duda' | 'auditoria' | 'opid' | 'decision';

export const COLUMNAS_KNOWLEDGE = ['id', 'seccion', 'titulo', 'contenido', 'origen_archivo'] as const;

/** Separador de los campos `multi` y `lista`. */
export const SEP = ' | ';

export type EstadoHC = 'borrador' | 'completa';

export interface FilaHC {
  dni: string;
  episodio: number;
  estado: EstadoHC;
  completitud: number;
  version: number;
  esquema_version: string;
  creado_en: string;
  actualizado_en: string;
  valores: Record<string, string>;
}

export interface ResumenHC {
  dni: string;
  episodio: number;
  estado: EstadoHC;
  completitud: number;
  version: number;
  actualizado_en: string;
  apellidos: string;
  nombres: string;
  sintoma_guia: string;
}

export interface Duda {
  id: string;
  seccion: string;
  campo_id: string;
  pregunta: string;
  estado: 'pendiente' | 'resuelta';
  fecha: string;
}

// ---------- Acciones ----------

export interface PingRespuesta {
  esquema_version: string;
  modelo: string;
  gemini: boolean;
  hora: string;
}

export interface CatalogosPayload {
  desde?: string;
}
export type CatalogosRespuesta = Catalogos | { sinCambios: true; version: string };

export interface ListarPayload {
  limite?: number;
  cursor?: number;
}
export interface ListarRespuesta {
  filas: ResumenHC[];
  cursor: number | null;
}

export interface ClavePayload {
  dni: string;
  episodio: number;
}
export interface ObtenerRespuesta {
  fila: FilaHC;
  dudas: Duda[];
}

export interface CrearPayload {
  dni: string;
  valores?: Record<string, string>;
}
export interface CrearRespuesta {
  fila: FilaHC;
}

export interface CampoGuardar {
  id: string;
  valor: string;
  /** Valor del servidor sobre el que se hizo el cambio. Si el servidor ya no lo tiene, hay conflicto. */
  base: string;
}
export interface GuardarPayload {
  dni: string;
  episodio: number;
  version: number;
  campos: CampoGuardar[];
  estado?: EstadoHC;
  completitud?: number;
  dudas_resueltas?: string[];
}
export interface ConflictoGuardado {
  id: string;
  servidor: string;
  enviado: string;
}
export interface GuardarRespuesta {
  fila: FilaHC;
  conflictos: ConflictoGuardado[];
}

export type OrigenEntrada = 'voz' | 'texto';

export interface TranscribirPayload {
  audioBase64: string;
  mime: string;
  dni: string;
  episodio: number;
  seccion: string;
}
export interface TranscribirRespuesta {
  transcripcion: string;
  registro_id: string;
  drive_file_id: string;
}

/** `seccion` puede ser `*` para repartir en toda la historia. */
export interface OrganizarPayload {
  texto: string;
  origen: OrigenEntrada;
  dni: string;
  episodio: number;
  seccion: string;
  /** Si se indica, solo se devuelve ese campo (pulir la redacción de un campo). */
  campo_objetivo?: string;
  /** Valores ya registrados en el dispositivo (pueden ir por delante del servidor). */
  contexto: Record<string, string>;
}
export interface CampoPropuesto {
  id: string;
  valor: string;
  confianza: number;
}
export interface EscalaSugerida {
  campo: string;
  lista_id: string;
  razon: string;
}
export interface ConflictoEntrada {
  campo: string;
  registrado: string;
  entrada: string;
}
export interface Descartado {
  campo: string;
  valor: string;
  motivo: string;
}
export interface OrganizarRespuesta {
  campos: CampoPropuesto[];
  dudas: Duda[];
  escalas_sugeridas: EscalaSugerida[];
  conflictos: ConflictoEntrada[];
  descartados: Descartado[];
  registro_id: string;
}

export interface RevisarPayload {
  dni: string;
  episodio: number;
  valores: Record<string, string>;
}
export interface RevisarRespuesta {
  faltantes: { campo: string; motivo: string }[];
  incoherencias: { campos: string[]; descripcion: string }[];
  redaccion: { campo: string; observacion: string; sugerido: string }[];
}

export interface OpLote {
  action: 'hc.guardar';
  opId: string;
  payload: GuardarPayload;
}
export interface ResultadoLote {
  opId: string;
  ok: boolean;
  data?: GuardarRespuesta;
  error?: string;
  codigo?: string;
}

export interface KbCargarPayload {
  filas: KnowledgeFila[];
  reemplazar: boolean;
}

export interface LoginPayload {
  usuario: string;
  clave: string;
}
export interface LoginRespuesta {
  /** Token de sesión: va en el cuerpo de cada petición. */
  token: string;
  usuario: string;
  expira: string;
}
export interface CambiarClavePayload {
  clave_actual: string;
  clave_nueva: string;
  usuario_nuevo?: string;
}

// ---------- Laboratorio desde foto ----------

export interface LaboratorioPayload {
  dni: string;
  episodio: number;
  imagenBase64: string;
  mime: string;
}
export interface ResultadoLeido {
  examen: string;
  parametro: string;
  valor: string;
  unidad: string;
  referencia: string;
  nota: string;
}
export interface LaboratorioRespuesta {
  /** Fecha del informe (AAAA-MM-DD) si se lee; si no, vacía. */
  fecha: string;
  resultados: ResultadoLeido[];
  advertencias: string[];
  drive_file_id: string;
}

// ---------- Redacciones: presentación de caso, epicrisis y evolución del día ----------

export type TipoRedaccion = 'presentacion' | 'epicrisis' | 'evolucion';
export interface RedactarPayload {
  dni: string;
  episodio: number;
  tipo: TipoRedaccion;
  /** Valores de la historia, incluidas las columnas de sistema (evoluciones y laboratorio). */
  valores: Record<string, string>;
  /** Datos del alta (epicrisis) o notas del día (evolución). */
  extra: Record<string, string>;
}
export interface Soap {
  subjetivo: string;
  objetivo: string;
  analisis: string;
  plan: string;
}
export interface RedactarRespuesta {
  texto: string;
  soap: Soap | null;
}

// ---------- Revisión con las notas: decisiones ----------

export type EstadoDecision = 'seguir_nota' | 'mantener_app' | 'consultar_docente';
export interface Decision {
  /** Área y número del punto: «03-7». */
  punto: string;
  decision: EstadoDecision;
  comentario: string;
  fecha: string;
}

/** Mapa acción → [payload, respuesta]. */
export interface ApiMapa {
  ping: [Record<string, never>, PingRespuesta];
  'catalogos.get': [CatalogosPayload, CatalogosRespuesta];
  'hc.list': [ListarPayload, ListarRespuesta];
  'hc.get': [ClavePayload, ObtenerRespuesta];
  'hc.crear': [CrearPayload, CrearRespuesta];
  'hc.guardar': [GuardarPayload, GuardarRespuesta];
  'entrada.transcribir': [TranscribirPayload, TranscribirRespuesta];
  'entrada.organizar': [OrganizarPayload, OrganizarRespuesta];
  'hc.revisar': [RevisarPayload, RevisarRespuesta];
  'sync.lote': [{ ops: OpLote[] }, { resultados: ResultadoLote[] }];
  'kb.cargar': [KbCargarPayload, { total: number }];
  'auth.login': [LoginPayload, LoginRespuesta];
  'auth.cambiar': [CambiarClavePayload, { usuario: string }];
  'auth.salir': [Record<string, never>, { ok: boolean }];
  'entrada.laboratorio': [LaboratorioPayload, LaboratorioRespuesta];
  'entrada.redactar': [RedactarPayload, RedactarRespuesta];
  'revision.decidir': [{ decisiones: Decision[] }, { total: number }];
  'revision.listar': [Record<string, never>, { decisiones: Decision[] }];
}

/** Acciones que no piden sesión. */
export const ACCIONES_PUBLICAS: readonly Accion[] = ['auth.login'];
export type Accion = keyof ApiMapa;

export interface Peticion<A extends Accion = Accion> {
  action: A;
  /** Token de sesión obtenido con auth.login. */
  token: string;
  opId?: string;
  payload: ApiMapa[A][0];
}

export type Respuesta<T> = { ok: true; data: T } | { ok: false; error: string; codigo?: string };
