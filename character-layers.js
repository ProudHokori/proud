/* Rigid image layers and independent eyes; no face or texture deformation. */
(() => {
  'use strict';
  window.mountPortfolioCharacter = function(button, options) {
    if (!button || button.dataset.mounted || !options.baseSrc) return;
    button.dataset.mounted = 'true';
    const canvas=button.querySelector('canvas'), original=button.querySelector('img');
    const ctx=canvas.getContext('2d',{alpha:true}); if(!ctx)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'), base=new Image();
    // Trace the original sleeve and fingers as one rigid shoulder-mounted layer.
    const arm=new Path2D('M 423 731 C 365 708 319 729 266 762 L 235 746 C 230 728 239 695 228 681 C 214 664 202 683 197 696 C 180 686 173 660 159 666 C 144 672 154 692 160 706 C 146 696 131 678 122 689 C 111 700 130 716 142 724 C 119 715 106 714 105 729 C 105 742 121 748 135 751 C 111 745 109 759 119 771 C 130 782 155 779 165 787 C 149 799 151 823 163 846 C 187 899 238 943 296 936 C 330 935 354 922 376 899 L 403 813 Z');
    let ready=false,visible=true,frame=0,timer=0,lastTime=0;
    let x=0,y=0,vx=0,vy=0,targetX=0,targetY=0,idleX=0,idleY=0;
    let waveAt=-10000,blinkAt=-10000,delightAt=-10000,inside=false;
    const clamp=v=>Math.max(-1,Math.min(1,v));
    const requestFrame=()=>{if(ready&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);};
    const ellipse=(cx,cy,rx,ry)=>{ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);};
    function eye(cx,cy,angle,blink,gx,gy) {
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
      // Enlarge the whole eye together, keeping its glossy look and thin white rim.
      ctx.scale(1.24,1.22);
      ctx.strokeStyle='#4a2c21';ctx.lineWidth=7;ctx.lineCap='round';
      const side=cx<512?-1:1;
      if(blink>.86){ctx.beginPath();ctx.moveTo(-35,0);ctx.quadraticCurveTo(0,20,35,0);ctx.stroke();ctx.restore();return;}
      ctx.scale(1,1-blink*.96);
      ctx.beginPath();ctx.moveTo(side*29,-25);ctx.quadraticCurveTo(side*47,-24,side*50,-35);ctx.moveTo(side*34,-12);ctx.quadraticCurveTo(side*52,-10,side*55,-19);ctx.stroke();
      const outer=ctx.createRadialGradient(-12,-23,2,0,0,56);
      outer.addColorStop(0,'#ffffff');outer.addColorStop(.65,'#fffdf8');outer.addColorStop(1,'#e8ddd5');
      ellipse(0,0,42,49);ctx.fillStyle=outer;ctx.fill();
      ctx.save();ellipse(0,0,40,47);ctx.clip();
      const px=gx*8,py=gy*6;
      const iris=ctx.createRadialGradient(px-8,py-18,3,px,py,40);
      // Preserve the original single, glossy dark eye; only its surround is white.
      iris.addColorStop(0,'#79513a');iris.addColorStop(.55,'#513322');iris.addColorStop(1,'#362218');
      ellipse(px,py,35,43);ctx.fillStyle=iris;ctx.fill();
      ellipse(px-12,py-23,10,11);ctx.fillStyle='#fffaf2';ctx.fill();
      ellipse(px+11,py+20,4,5);ctx.fillStyle='rgba(255,224,175,.62)';ctx.fill();
      ctx.restore();ctx.restore();
    }
    function draw(time) {
      frame=0;if(!ready||!visible||document.hidden)return;
      const dt=Math.min(.032,(time-(lastTime||time-16))/1000);lastTime=time;
      const tx=reduced.matches?0:clamp(targetX+idleX),ty=reduced.matches?0:clamp(targetY+idleY);
      vx+=(tx-x)*130*dt;vy+=(ty-y)*130*dt;vx*=Math.exp(-18*dt);vy*=Math.exp(-18*dt);x+=vx*dt;y+=vy*dt;
      const be=(time-blinkAt)/1000,blinking=!reduced.matches&&be>=0&&be<.22;
      const blink=blinking?Math.pow(Math.sin(Math.PI*be/.22),2):0;
      const we=(time-waveAt)/1000,waving=!reduced.matches&&we>=0&&we<1.55;
      const wave=waving?Math.sin(we*14)*Math.sin(Math.PI*we/1.55)*.16:0;
      const de=(time-delightAt)/1000,delight=!reduced.matches&&de>=0&&de<.7;
      const bounce=delight?Math.sin(Math.PI*de/.7)*-12:0;
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.scale(canvas.width/1024,canvas.height/1536);
      ctx.translate(512,800+bounce);ctx.rotate(reduced.matches?0:x*.022);ctx.scale(.9,.9);ctx.translate(-512,-800);
      ctx.drawImage(base,0,0,1024,1536);
      ctx.save();ctx.translate(400,780);ctx.rotate(wave+(reduced.matches?0:-y*.016));ctx.translate(-400,-780);
      ctx.clip(arm);ctx.drawImage(original,0,0,1024,1536);ctx.restore();
      eye(399,509,.24,blink,x,y);eye(651,562,.24,blink,x,y);
      canvas.dataset.gaze=`${x.toFixed(3)},${y.toFixed(3)}`;canvas.dataset.handAngle=wave.toFixed(3);canvas.dataset.blink=blink.toFixed(3);
      if(blinking||waving||delight||Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.005)requestFrame();
    }
    function scheduleIdle() {
      clearTimeout(timer);if(!ready||!visible||document.hidden||reduced.matches)return;
      timer=setTimeout(()=>{blinkAt=performance.now();idleX=(Math.random()-.5)*.14;idleY=(Math.random()-.5)*.07;requestFrame();scheduleIdle();},2800+Math.random()*2300);
    }
    const resize=()=>{const r=button.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));requestFrame();};
    const loadImage=img=>new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)return resolve();img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});
    base.src=options.baseSrc;
    Promise.all([loadImage(base),loadImage(original)]).then(()=>{ready=true;resize();button.classList.add('is-ready');scheduleIdle();}).catch(()=>{});
    const hello=()=>{if(reduced.matches)return;waveAt=performance.now();delightAt=waveAt;blinkAt=waveAt+260;requestFrame();};
    const neutral=()=>{targetX=targetY=idleX=idleY=0;inside=false;requestFrame();};
    window.addEventListener('pointermove',e=>{
      if(!visible||reduced.matches||e.pointerType==='touch')return;
      const r=button.getBoundingClientRect();targetX=clamp((e.clientX-r.left-r.width*.5)/(innerWidth*.32));targetY=clamp((e.clientY-r.top-r.height*.35)/(innerHeight*.45));idleX=idleY=0;
      const next=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
      if(next&&!inside)hello();inside=next;requestFrame();
    },{passive:true});
    button.addEventListener('click',hello);
    button.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||reduced.matches)return;const r=button.getBoundingClientRect();targetX=clamp((e.clientX-r.left)/r.width*2-1);targetY=clamp((e.clientY-r.top)/r.height*2-1);requestFrame();},{passive:true});
    button.addEventListener('pointerup',e=>{if(e.pointerType==='touch')neutral();});button.addEventListener('pointercancel',neutral);
    document.documentElement.addEventListener('pointerleave',neutral);window.addEventListener('blur',neutral);
    new ResizeObserver(resize).observe(button);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){clearTimeout(timer);cancelAnimationFrame(frame);frame=0;}else{lastTime=0;requestFrame();scheduleIdle();}},{rootMargin:'80px'}).observe(button);
    document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(document.hidden){cancelAnimationFrame(frame);frame=0;neutral();}else{lastTime=0;requestFrame();scheduleIdle();}});
    reduced.addEventListener('change',()=>{x=y=vx=vy=0;waveAt=blinkAt=delightAt=-10000;neutral();scheduleIdle();});
  };
})();
