/* Image-based 2.5D character rig. The PNG remains the visual source; this is
   not a reconstructed 3D model. Local UV deformation animates eyes and hand. */
(() => {
  'use strict';
  window.mountPortfolioCharacter = function(button, options) {
    if (!button || button.dataset.mounted) return;
    button.dataset.mounted = 'true';
    const canvas = button.querySelector('canvas');
    const image = button.querySelector('img');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return; // The accessible original image remains visible.
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const vertexSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
        gl_Position = vec4(position, 0., 1.);
      }`;
    const fragmentSource = `
      precision mediump float;
      varying vec2 uv;
      uniform sampler2D portrait;
      uniform vec2 gaze;
      uniform float handAngle;
      uniform vec2 eyeLeft;
      uniform vec2 eyeRight;
      uniform vec2 handPivot;
      uniform vec2 handCenter;
      vec2 rotateAt(vec2 point, vec2 pivot, float angle) {
        // Work in image pixels, correcting the portrait's 2:3 aspect ratio.
        vec2 p = (point - pivot) * vec2(1., 1.5);
        float s = sin(angle), c = cos(angle);
        return pivot + vec2(c*p.x-s*p.y, s*p.x+c*p.y)/vec2(1.,1.5);
      }
      float region(vec2 p, vec2 center, vec2 radius) {
        return 1. - smoothstep(.42, 1., length((p-center)/radius));
      }
      void main() {
        // Padding keeps the hair and waving fingers inside the canvas.
        vec2 p = (uv - .5) / .90 + .5;
        float head = 1. - smoothstep(.43, .56, p.y);
        p = mix(p, rotateAt(p, vec2(.5,.49), -gaze.x*.018), head);
        float hand = region(p, handCenter, vec2(.15,.115));
        p = mix(p, rotateAt(p, handPivot, -handAngle), hand);
        float eyes = max(region(p,eyeLeft,vec2(.064,.052)), region(p,eyeRight,vec2(.064,.052)));
        p -= gaze * vec2(.009,.006) * eyes;
        if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) {
          gl_FragColor = vec4(0.);
        } else {
          gl_FragColor = texture2D(portrait,p);
        }
      }`;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('Character shader unavailable');
      }
      return shader;
    };
    let program;
    try {
      program = gl.createProgram();
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      gl.attachShader(program, vertex); gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Character program unavailable');
    } catch (_) { return; }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['gaze','handAngle','eyeLeft','eyeRight','handPivot','handCenter','portrait'].map(name => [name,gl.getUniformLocation(program,name)]));
    const rig = options.rig || {};
    gl.uniform2fv(uniforms.eyeLeft, rig.eyeLeft || [.388,.333]);
    gl.uniform2fv(uniforms.eyeRight, rig.eyeRight || [.641,.367]);
    gl.uniform2fv(uniforms.handPivot, rig.handPivot || [.28,.57]);
    gl.uniform2fv(uniforms.handCenter, rig.handCenter || [.18,.49]);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uniforms.portrait, 0);
    let ready = false, visible = true, frame = 0, lastTime = 0;
    let targetX = 0, targetY = 0, x = 0, y = 0, waveStart = -10000;
    let pointerInside = false;
    const clamp = value => Math.max(-1,Math.min(1,value));
    const requestFrame = () => {
      if (ready && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    function draw(time) {
      frame = 0;
      if (!ready || !visible || document.hidden) return;
      const delta = Math.min(64, time-(lastTime || time-16));
      lastTime = time;
      const smoothing = 1-Math.exp(-delta/100);
      x += (targetX-x)*smoothing; y += (targetY-y)*smoothing;
      const elapsed = (time-waveStart)/1000;
      const waving = elapsed >= 0 && elapsed < 1.8 && !reducedMotion.matches;
      const wave = waving ? Math.sin(elapsed*15) * Math.sin(Math.PI*elapsed/1.8)*.14 : 0;
      const hand = reducedMotion.matches ? 0 : wave + x*.025-y*.04;
      gl.uniform2f(uniforms.gaze,x,y);
      gl.uniform1f(uniforms.handAngle,hand);
      gl.drawArrays(gl.TRIANGLES,0,6);
      button.style.transform = reducedMotion.matches ? '' : `rotateY(${x*7}deg) rotateX(${-y*4}deg)`;
      // Expose only the rendered pose for diagnostics, not an animation API.
      canvas.dataset.gaze = `${x.toFixed(3)},${y.toFixed(3)}`;
      canvas.dataset.handAngle = hand.toFixed(3);
      if (waving || Math.abs(targetX-x)+Math.abs(targetY-y)>.002) requestFrame();
    }
    const resize = () => {
      const rect = button.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1,2);
      canvas.width = Math.max(1,Math.round(rect.width*ratio));
      canvas.height = Math.max(1,Math.round(rect.height*ratio));
      gl.viewport(0,0,canvas.width,canvas.height);
      requestFrame();
    };
    const load = () => {
      if (ready || !image.naturalWidth) return;
      try { gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); }
      catch (_) { return; }
      ready = true;
      resize();
      button.classList.add('is-ready');
    };
    if (image.complete) load(); else image.addEventListener('load',load,{once:true});
    const wave = () => { waveStart = performance.now(); requestFrame(); };
    const neutral = () => { targetX=0; targetY=0; pointerInside=false; requestFrame(); };
    window.addEventListener('pointermove',event => {
      if (!visible || reducedMotion.matches || event.pointerType==='touch') return;
      const rect = button.getBoundingClientRect();
      targetX = clamp((event.clientX-(rect.left+rect.width*.5))/(innerWidth*.35));
      targetY = clamp((event.clientY-(rect.top+rect.height*.33))/(innerHeight*.45));
      const inside = event.clientX>=rect.left && event.clientX<=rect.right && event.clientY>=rect.top && event.clientY<=rect.bottom;
      if (inside && !pointerInside) wave();
      pointerInside=inside;
      requestFrame();
    },{passive:true});
    document.documentElement.addEventListener('pointerleave',neutral);
    window.addEventListener('blur',neutral);
    button.addEventListener('click',wave); // Native button also supports Enter and Space.
    button.addEventListener('pointerdown',event => {
      if (event.pointerType!=='touch' || reducedMotion.matches) return;
      const rect=button.getBoundingClientRect();
      targetX=clamp((event.clientX-rect.left)/rect.width*2-1);
      targetY=clamp((event.clientY-rect.top)/rect.height*2-1);
      requestFrame();
    },{passive:true});
    button.addEventListener('pointerup',event => { if(event.pointerType==='touch') neutral(); });
    button.addEventListener('pointercancel',neutral);
    reducedMotion.addEventListener('change',() => { waveStart=-10000; if(reducedMotion.matches) x=y=0; neutral(); });
    new ResizeObserver(resize).observe(button);
    new IntersectionObserver(entries => {
      visible=entries[0].isIntersecting;
      if (visible) requestFrame();
    },{rootMargin:'80px'}).observe(button);
    document.addEventListener('visibilitychange',() => {
      if(document.hidden) { waveStart=-10000; targetX=targetY=0; }
      else requestFrame();
    });
    canvas.addEventListener('webglcontextlost',event => {
      event.preventDefault(); ready=false; cancelAnimationFrame(frame); frame=0;
      button.classList.remove('is-ready'); button.style.transform='';
    });
  };
})();
