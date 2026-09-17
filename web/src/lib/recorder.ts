// Grabación con MediaRecorder. Formatos que Gemini acepta tal cual: ogg, mp4/m4a, webm.

const PREFERIDOS = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm'];

export const MAX_SEGUNDOS = 10 * 60;

export function puedeGrabar(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

function mimeGrabacion(): string {
  return PREFERIDOS.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

/** Normaliza el tipo de un archivo subido (las notas de voz de WhatsApp llegan como .opus sin tipo). */
export function mimeDeArchivo(f: File): string {
  const t = f.type.split(';')[0].toLowerCase();
  if (t.startsWith('audio/')) return t === 'audio/x-m4a' ? 'audio/m4a' : t;
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  const porExt: Record<string, string> = {
    opus: 'audio/ogg',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    m4a: 'audio/m4a',
    mp4: 'audio/mp4',
    aac: 'audio/aac',
    mp3: 'audio/mp3',
    wav: 'audio/wav',
    webm: 'audio/webm',
    flac: 'audio/flac',
  };
  return porExt[ext] ?? '';
}

export interface Grabacion {
  blob: Blob;
  mime: string;
  segundos: number;
}

export class Grabadora {
  private rec: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private trozos: Blob[] = [];
  private inicio = 0;
  private analizador: AnalyserNode | null = null;
  private ctx: AudioContext | null = null;
  private fin: ((g: Grabacion) => void) | null = null;
  private limite: ReturnType<typeof setTimeout> | undefined;

  get grabando(): boolean {
    return this.rec?.state === 'recording';
  }

  get segundos(): number {
    return this.inicio ? Math.round((Date.now() - this.inicio) / 1000) : 0;
  }

  /** Nivel de entrada entre 0 y 1, para dibujar el vúmetro. */
  nivel(): number {
    if (!this.analizador) return 0;
    const datos = new Uint8Array(this.analizador.fftSize);
    this.analizador.getByteTimeDomainData(datos);
    let max = 0;
    for (const v of datos) max = Math.max(max, Math.abs(v - 128));
    return Math.min(1, max / 64);
  }

  async iniciar(alLimite: () => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    const mime = mimeGrabacion();
    this.rec = new MediaRecorder(this.stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32_000 });
    this.trozos = [];
    this.rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.trozos.push(e.data);
    };
    this.rec.onstop = () => {
      const tipo = (this.rec?.mimeType || mime || 'audio/webm').split(';')[0];
      const g = { blob: new Blob(this.trozos, { type: tipo }), mime: tipo, segundos: this.segundos };
      this.liberar();
      this.fin?.(g);
    };
    try {
      this.ctx = new AudioContext();
      this.analizador = this.ctx.createAnalyser();
      this.analizador.fftSize = 512;
      this.ctx.createMediaStreamSource(this.stream).connect(this.analizador);
    } catch {
      this.analizador = null;
    }
    this.rec.start(1000);
    this.inicio = Date.now();
    this.limite = setTimeout(alLimite, MAX_SEGUNDOS * 1000);
  }

  detener(): Promise<Grabacion> {
    return new Promise((resolve, reject) => {
      if (!this.rec || this.rec.state === 'inactive') {
        reject(new Error('No hay grabación en curso'));
        return;
      }
      this.fin = resolve;
      this.rec.stop();
    });
  }

  cancelar(): void {
    this.fin = null;
    if (this.rec && this.rec.state !== 'inactive') this.rec.stop();
    this.liberar();
  }

  private liberar(): void {
    clearTimeout(this.limite);
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close().catch(() => undefined);
    this.stream = null;
    this.ctx = null;
    this.analizador = null;
    this.inicio = 0;
  }
}
