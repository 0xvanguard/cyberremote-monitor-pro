// ═══════════════════════════════════════════════════════════
//  CyberRemote Monitor — Globe 3D · Space View
//  Three.js r134 · WebGL globe with heatmap dots + atmosphere
//  v2.2 — Fixed black screen: force pixel dimensions before renderer init
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';

  let scene, camera, renderer, globe, atmoMesh, starField;
  let dotGroup, glowGroup;
  let autoRotate = true;
  let showAtmo   = true;
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  let spherical  = { theta: 0, phi: Math.PI / 2 };
  let camDist    = 2.6;
  let rafId      = null;
  let dots       = [];
  let globeInited = false;
  const RADIUS   = 1.0;
  const GLOBE_H  = 640;   // fixed height in px

  let activeFilters = {
    region: 'all', tier: 'all',
    scoreMin: 0, scoreMax: 100,
    entryFast: false, modality: 'all'
  };

  // ── Helpers ───────────────────────────────────────────
  function heatColor(i) {
    if (i >= 90) return 0x16a34a; if (i >= 75) return 0x4ade80;
    if (i >= 60) return 0xf59e0b; if (i >= 45) return 0x0ea5e9;
    if (i >= 25) return 0x6366f1; return 0x334155;
  }
  function heatColorCSS(i) {
    if (i >= 90) return '#16a34a'; if (i >= 75) return '#4ade80';
    if (i >= 60) return '#f59e0b'; if (i >= 45) return '#0ea5e9';
    if (i >= 25) return '#6366f1'; return '#334155';
  }
  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ── Filters ──────────────────────────────────────────
  function passesFilter(code, d) {
    if (activeFilters.region !== 'all' && d.region !== activeFilters.region) return false;
    if (activeFilters.tier   !== 'all' && d.tier   !== parseInt(activeFilters.tier)) return false;
    if (d.intensity < activeFilters.scoreMin || d.intensity > activeFilters.scoreMax) return false;
    if (activeFilters.entryFast && !d.fastEntry) return false;
    if (activeFilters.modality === 'jobs'      && !(d.jobs      > 0)) return false;
    if (activeFilters.modality === 'freelance' && !(d.freelance > 0)) return false;
    if (activeFilters.modality === 'contract'  && !(d.contract  > 0)) return false;
    return true;
  }
  function applyFilters() {
    dots.forEach(({ mesh, glowMesh, ringMesh, code }) => {
      const vis = passesFilter(code, mesh.userData.d);
      mesh.visible = vis;
      if (glowMesh) glowMesh.visible = vis;
      if (ringMesh) ringMesh.visible = vis;
    });
  }

  // ── Get canvas pixel width, guaranteed > 0 ──────────────
  function getCanvasWidth(canvas) {
    // clientWidth can be 0 if display was 'none' even one frame ago.
    // Use offsetWidth as fallback, then parentElement, then 800.
    return canvas.clientWidth ||
           canvas.offsetWidth ||
           (canvas.parentElement ? canvas.parentElement.clientWidth : 0) ||
           800;
  }

  // ── Scene builder ───────────────────────────────────
  function buildScene(canvas) {
    const W = getCanvasWidth(canvas);
    const H = GLOBE_H;

    // Force explicit pixel dimensions on the canvas element
    canvas.width  = W;
    canvas.height = H;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x020817, 1);

    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    updateCameraPos();

    scene.add(new THREE.AmbientLight(0x1a2a3a, 2.5));
    const sun = new THREE.DirectionalLight(0x4488ff, 3.5); sun.position.set(5,3,5); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x0ea5e9, 1.2); rim.position.set(-4,-2,-3); scene.add(rim);

    // Stars
    const sc=2800, sp=new Float32Array(sc*3), sco=new Float32Array(sc*3);
    for(let i=0;i<sc;i++){
      const r=18+Math.random()*32,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);
      sp[i*3]=r*Math.sin(p)*Math.cos(t); sp[i*3+1]=r*Math.cos(p); sp[i*3+2]=r*Math.sin(p)*Math.sin(t);
      const v=Math.random(); sco[i*3]=0.7+v*0.3; sco[i*3+1]=0.75+v*0.25; sco[i*3+2]=0.9+v*0.1;
    }
    const sg=new THREE.BufferGeometry();
    sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
    sg.setAttribute('color',new THREE.BufferAttribute(sco,3));
    starField=new THREE.Points(sg,new THREE.PointsMaterial({size:.045,vertexColors:true,transparent:true,opacity:.85}));
    scene.add(starField);

    // Globe sphere
    globe=new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS,64,64),
      new THREE.MeshPhongMaterial({color:0x0a1628,emissive:0x030c1a,shininess:18,specular:0x0ea5e9})
    );
    scene.add(globe);

    // Grid lines
    const gm=new THREE.LineBasicMaterial({color:0x0ea5e9,transparent:true,opacity:.08});
    for(let lat=-80;lat<=80;lat+=20){
      const pts=[]; for(let lng=0;lng<=360;lng+=4) pts.push(latLngToVec3(lat,lng-180,RADIUS+.002));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gm));
    }
    for(let lng=0;lng<360;lng+=20){
      const pts=[]; for(let lat=-90;lat<=90;lat+=3) pts.push(latLngToVec3(lat,lng-180,RADIUS+.002));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gm));
    }

    // Atmosphere
    atmoMesh=new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS*1.085,64,64),
      new THREE.MeshPhongMaterial({color:0x0ea5e9,emissive:0x062040,transparent:true,opacity:.13,side:THREE.FrontSide,depthWrite:false})
    ); scene.add(atmoMesh);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS*1.16,64,64),
      new THREE.MeshPhongMaterial({color:0x0284c7,emissive:0x020c18,transparent:true,opacity:.045,side:THREE.BackSide,depthWrite:false})
    ));

    dotGroup=new THREE.Group(); scene.add(dotGroup);
    glowGroup=new THREE.Group(); scene.add(glowGroup);
  }

  // ── Dots ─────────────────────────────────────────────
  function buildDots(dataset) {
    dotGroup.clear(); glowGroup.clear(); dots=[];
    Object.entries(dataset).forEach(([code,d])=>{
      if(!d.latlng) return;
      const [lat,lng]=d.latlng;
      const pos=latLngToVec3(lat,lng,RADIUS+.012);
      const col=heatColor(d.intensity);
      const size=.012+(d.intensity/100)*.022;
      const mesh=new THREE.Mesh(
        new THREE.SphereGeometry(size,10,10),
        new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:.6,shininess:80})
      ); mesh.position.copy(pos); mesh.userData={code,d}; dotGroup.add(mesh);
      const glowMesh=new THREE.Mesh(
        new THREE.SphereGeometry(size*2.4,10,10),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18,depthWrite:false})
      ); glowMesh.position.copy(pos); glowGroup.add(glowMesh);
      let ringMesh=null;
      if(d.fastEntry){
        ringMesh=new THREE.Mesh(
          new THREE.RingGeometry(size*2.2,size*2.8,24),
          new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false})
        ); ringMesh.position.copy(pos); ringMesh.lookAt(new THREE.Vector3(0,0,0));
        ringMesh.userData.isPulse=true; glowGroup.add(ringMesh);
      }
      dots.push({mesh,glowMesh,ringMesh,code,lat,lng});
    });
    applyFilters();
  }

  // ── Camera ──────────────────────────────────────────
  function updateCameraPos() {
    camera.position.set(
      camDist*Math.sin(spherical.phi)*Math.cos(spherical.theta),
      camDist*Math.cos(spherical.phi),
      camDist*Math.sin(spherical.phi)*Math.sin(spherical.theta)
    ); camera.lookAt(0,0,0);
  }

  // ── Raycasting ─────────────────────────────────────
  function onCanvasClick(e) {
    const canvas=renderer.domElement;
    const rect=canvas.getBoundingClientRect();
    const mouse=new THREE.Vector2(
      ((e.clientX-rect.left)/rect.width)*2-1,
      -((e.clientY-rect.top)/rect.height)*2+1
    );
    const ray=new THREE.Raycaster();
    ray.setFromCamera(mouse,camera);
    const hits=ray.intersectObjects(dots.filter(d=>d.mesh.visible).map(d=>d.mesh));
    if(hits.length){
      const {code}=hits[0].object.userData;
      if(typeof window.updateCountryPanel==='function') window.updateCountryPanel(code);
      const mat=hits[0].object.material;
      const orig=mat.emissiveIntensity;
      mat.emissiveIntensity=2;
      setTimeout(()=>{mat.emissiveIntensity=orig;},300);
    }
  }

  // ── Mouse / Touch ─────────────────────────────────
  function onMouseDown(e){isDragging=true;prevMouse={x:e.clientX,y:e.clientY};}
  function onMouseMove(e){
    if(!isDragging)return;
    spherical.phi=Math.max(.1,Math.min(Math.PI-.1,spherical.phi-(e.clientY-prevMouse.y)*.005));
    spherical.theta+=(e.clientX-prevMouse.x)*.005;
    updateCameraPos(); prevMouse={x:e.clientX,y:e.clientY};
  }
  function onMouseUp(){isDragging=false;}
  function onWheel(e){camDist=Math.max(1.5,Math.min(5.5,camDist+e.deltaY*.003));updateCameraPos();e.preventDefault();}
  let lastTD=0;
  function onTouchStart(e){
    if(e.touches.length===1){isDragging=true;prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};}
    if(e.touches.length===2){lastTD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}
  }
  function onTouchMove(e){
    if(e.touches.length===1&&isDragging){
      spherical.phi=Math.max(.1,Math.min(Math.PI-.1,spherical.phi-(e.touches[0].clientY-prevMouse.y)*.005));
      spherical.theta+=(e.touches[0].clientX-prevMouse.x)*.005;
      updateCameraPos(); prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};
    }
    if(e.touches.length===2){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      camDist=Math.max(1.5,Math.min(5.5,camDist-(d-lastTD)*.008)); updateCameraPos(); lastTD=d;
    }
    e.preventDefault();
  }
  function onTouchEnd(){isDragging=false;}

  // ── Animate ─────────────────────────────────────────
  let clock={t:0};
  function animate(){
    rafId=requestAnimationFrame(animate);
    clock.t+=.01;
    if(autoRotate&&!isDragging){spherical.theta+=.0018;updateCameraPos();}
    glowGroup.children.forEach(m=>{
      if(m.userData&&m.userData.isPulse){
        const s=1+.25*Math.sin(clock.t*2.5+m.position.x*5);
        m.scale.setScalar(s); m.material.opacity=.3+.2*Math.sin(clock.t*3);
      }
    });
    if(starField) starField.rotation.y+=.00008;
    renderer.render(scene,camera);
  }

  // ── Public: resizeGlobe (called by switchView each toggle) ─
  window.resizeGlobe=function(){
    if(!renderer) return;
    const canvas=renderer.domElement;
    const W=getCanvasWidth(canvas);
    const H=GLOBE_H;
    canvas.width=W; canvas.height=H;
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    renderer.setSize(W,H,false);
    camera.aspect=W/H;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize',()=>{ if(renderer) window.resizeGlobe(); });

  // ── Public controls ────────────────────────────────
  window.toggleAutoRotate=function(){autoRotate=!autoRotate;const btn=document.getElementById('btnAutoRotate');if(btn)btn.classList.toggle('active',autoRotate);};
  window.resetGlobeView=function(){spherical={theta:0,phi:Math.PI/2};camDist=2.6;updateCameraPos();};
  window.toggleAtmosphere=function(){showAtmo=!showAtmo;if(atmoMesh)atmoMesh.visible=showAtmo;const btn=document.getElementById('btnAtmo');if(btn)btn.classList.toggle('active',showAtmo);};
  window.setGlobeFilter=function(key,value){
    if(key==='entryFast') activeFilters.entryFast=(value===true||value==='true');
    else activeFilters[key]=value;
    applyFilters();
  };
  window.resetGlobeFilters=function(){
    activeFilters={region:'all',tier:'all',scoreMin:0,scoreMax:100,entryFast:false,modality:'all'};
    applyFilters();
  };

  // ── Init — ALWAYS called explicitly by switchView('3d') ──
  window.initGlobe=function(){
    if(globeInited) return;
    const canvas=document.getElementById('globeCanvas');
    if(!canvas||typeof THREE==='undefined') return;

    buildScene(canvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('mouseleave',onMouseUp);
    canvas.addEventListener('click',     onCanvasClick);
    canvas.addEventListener('wheel',     onWheel,{passive:false});
    canvas.addEventListener('touchstart',onTouchStart,{passive:false});
    canvas.addEventListener('touchmove', onTouchMove, {passive:false});
    canvas.addEventListener('touchend',  onTouchEnd);

    function waitForDataset(tries){
      if(window.dataset&&Object.keys(window.dataset).length>0){
        buildDots(window.dataset);
        animate();
        const first=Object.entries(window.dataset).sort((a,b)=>b[1].intensity-a[1].intensity)[0];
        if(first&&typeof window.updateCountryPanel==='function') window.updateCountryPanel(first[0]);
      } else if(tries>0){
        setTimeout(()=>waitForDataset(tries-1),300);
      }
    }
    waitForDataset(30);
    globeInited=true;
  };

  window.applyFilters=applyFilters;
  window.activeFilters=activeFilters;

})();
