/* Torch & Vibrate — minimal PWA */
(() => {
  'use strict';

  const torchBtn = document.getElementById('torch');
  const torchState = document.getElementById('torch-state');
  const vibrateBtn = document.getElementById('vibrate');
  const vibrateState = document.getElementById('vibrate-state');
  const hint = document.getElementById('hint');

  let stream = null;
  let track = null;
  let torchOn = false;

  const say = (msg) => { hint.textContent = msg; };

  // The camera (and therefore the torch) API only works in a secure context:
  // https://, or http://localhost. Flagging it early avoids a confusing failure.
  if (!window.isSecureContext) {
    torchBtn.disabled = true;
    say('Needs HTTPS (or localhost) to control the torch. Vibration still works.');
  }

  /* ---------------- Torch ---------------- */

  async function getTorchTrack() {
    if (track) return track;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not available in this browser.');
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });

    track = stream.getVideoTracks()[0];

    const caps = track.getCapabilities ? track.getCapabilities() : {};
    if (!caps.torch) {
      stopStream();
      throw new Error('This device has no torch (flashlight) control.');
    }
    return track;
  }

  async function setTorch(on) {
    const t = await getTorchTrack();
    await t.applyConstraints({ advanced: [{ torch: on }] });
    torchOn = on;
    torchBtn.setAttribute('aria-pressed', String(on));
    torchState.textContent = on ? 'on' : 'off';
  }

  function stopStream() {
    if (stream) stream.getTracks().forEach((tr) => tr.stop());
    stream = null;
    track = null;
    torchOn = false;
  }

  torchBtn.addEventListener('click', async () => {
    torchBtn.disabled = true;
    try {
      if (torchOn) {
        await setTorch(false);
      } else {
        await setTorch(true);
        say('Torch is ON.');
      }
    } catch (err) {
      stopStream();
      torchBtn.setAttribute('aria-pressed', 'false');
      torchState.textContent = 'off';
      say(err && err.message ? err.message : 'Could not turn on the torch.');
    } finally {
      torchBtn.disabled = false;
    }
  });

  // Release the camera when the app goes to the background.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && torchOn) {
      setTorch(false).catch(() => {});
      stopStream();
      torchBtn.setAttribute('aria-pressed', 'false');
      torchState.textContent = 'off';
    }
  });

  /* ---------------- Vibrate ---------------- */

  const PATTERN = [180, 90, 180, 90, 400]; // vibrate, pause, vibrate, pause, vibrate

  function vibrate() {
    if (!navigator.vibrate) {
      say('Vibration is not supported on this device.');
      return;
    }
    navigator.vibrate(PATTERN);
  }

  vibrateBtn.addEventListener('click', () => {
    vibrate();
    vibrateState.textContent = 'on';
    vibrateBtn.classList.add('pressed');
    setTimeout(() => {
      vibrateState.textContent = 'tap';
      vibrateBtn.classList.remove('pressed');
    }, 1000);
  });

  /* ---------------- Install prompt ---------------- */

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    say('Tip: use your browser menu → “Add to Home screen”.');
  });

  // Register the service worker for offline use.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
