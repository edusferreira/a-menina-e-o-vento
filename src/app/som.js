// Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio, para o jogo continuar leve).
// Tudo é desligável nas configurações; falhas de áudio nunca interrompem o jogo.

export function criarSom(estaLigado) {
  let contexto = null;

  function audio() {
    if (!estaLigado()) return null;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      contexto ??= Ctx ? new Ctx() : null;
      if (contexto?.state === 'suspended') contexto.resume();
      return contexto;
    } catch {
      return null;
    }
  }

  function nota(freq, inicio, duracao, tipo = 'sine', volume = 0.12) {
    const ctx = audio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    const t = ctx.currentTime + inicio;
    osc.type = tipo;
    osc.frequency.setValueAtTime(freq, t);
    ganho.gain.setValueAtTime(0, t);
    ganho.gain.linearRampToValueAtTime(volume, t + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.001, t + duracao);
    osc.connect(ganho).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duracao + 0.05);
  }

  /** Rajada de vento: ruído branco passando por um filtro que varre as frequências. */
  function vento(duracao = 1.4) {
    const ctx = audio();
    if (!ctx) return;
    const tamanho = Math.floor(ctx.sampleRate * duracao);
    const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate);
    const canal = buffer.getChannelData(0);
    for (let i = 0; i < tamanho; i += 1) canal[i] = Math.random() * 2 - 1;
    const fonte = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const ganho = ctx.createGain();
    const t = ctx.currentTime;
    fonte.buffer = buffer;
    filtro.type = 'bandpass';
    filtro.Q.value = 1.2;
    filtro.frequency.setValueAtTime(300, t);
    filtro.frequency.exponentialRampToValueAtTime(1400, t + duracao * 0.4);
    filtro.frequency.exponentialRampToValueAtTime(250, t + duracao);
    ganho.gain.setValueAtTime(0, t);
    ganho.gain.linearRampToValueAtTime(0.25, t + duracao * 0.3);
    ganho.gain.linearRampToValueAtTime(0, t + duracao);
    fonte.connect(filtro).connect(ganho).connect(ctx.destination);
    fonte.start(t);
  }

  return {
    vento,
    acerto: () => { nota(660, 0, 0.18); nota(880, 0.14, 0.3); },
    erro: () => { nota(240, 0, 0.25, 'triangle'); nota(180, 0.2, 0.35, 'triangle'); },
    clique: () => nota(520, 0, 0.06, 'square', 0.03),
    final: () => [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.16, 0.4)),
  };
}
