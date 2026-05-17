// High-tech sound effects synthesizer using native Web Audio API
// This avoids needing external MP3 audio asset downloads and works in any modern browser!

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Sleek high-tech notification chime
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5 note
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second higher tone shortly after
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6 note
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.4);
      } catch (e) {
        console.error('Audio secondary chime error:', e);
      }
    }, 100);
  } catch (error) {
    console.warn('Web Audio API is blocked or unsupported on first load until user interaction.', error);
  }
}

// 2. Pulsing high-priority alarm buzzer (for when deadlines hit!)
export function playAlarm() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Generate 3 successive warning beeps
    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.4;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Cyber alarm sound signature (sawtooth + sine modulation)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, startTime); // D5 note
      osc.frequency.linearRampToValueAtTime(880, startTime + 0.25); // sweep to A5
      
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.setValueAtTime(0.2, startTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    }
  } catch (error) {
    console.error('Failed playing Web Audio alarm buzzer:', error);
  }
}
