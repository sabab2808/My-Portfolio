/* ==========================================================================
   Shared WebGL layer.
     - #bg-scene-canvas : a single ambient particle field behind everything
     - every <canvas class="icon3d" data-icon="key"> on the page gets its
       own real WebGL context, positioned by normal CSS/DOM layout (not a
       JS-tracked overlay), so it scrolls perfectly in sync with the page —
       no per-frame position bookkeeping, no scroll lag.
   ========================================================================== */

(function () {
  if (typeof THREE === 'undefined') return; // CDN unreachable — CSS fallback in .icon3d covers this

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.innerWidth < 640;

  const COPPER = 0xe3a857;
  const COPPER_LIGHT = 0xf2c179;
  const SIGNAL = 0x63d496;

  const pointer = { x: 0, y: 0 };
  window.addEventListener('mousemove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  });

  /* ---------------- shared helpers ---------------- */

  function makeScene() {
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.PointLight(0xffffff, 1.15, 0, 2);
    key.position.set(3, 4, 5);
    const rim = new THREE.PointLight(SIGNAL, 0.7, 0, 2);
    rim.position.set(-4, -2, 3);
    scene.add(key, rim);
    return scene;
  }

  function makeCamera(z = 4.2) {
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, z);
    return camera;
  }

  /* ---------------- icon library ---------------- */

  const ICONS = {};

  ICONS.code = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.22, 110, 14),
      new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.4, roughness: 0.35, emissive: 0x2a1a06, emissiveIntensity: 0.35 })
    );
    group.add(mesh);
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.00035; group.rotation.x = Math.sin(t * 0.0004) * 0.3; } };
  };

  ICONS.layers = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const colors = [COPPER, SIGNAL, COPPER_LIGHT];
    colors.forEach((color, i) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.5, 0.1),
        new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.92 })
      );
      mesh.position.z = (i - 1) * 0.45;
      mesh.position.x = (i - 1) * 0.14;
      group.add(mesh);
    });
    group.rotation.x = 0.4;
    group.rotation.y = -0.5;
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = -0.5 + Math.sin(t * 0.0004) * 0.3; } };
  };

  ICONS.db = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.3, 28),
        new THREE.MeshStandardMaterial({ color: i % 2 ? SIGNAL : COPPER, metalness: 0.4, roughness: 0.4 })
      );
      mesh.position.y = (i - 1) * 0.4;
      group.add(mesh);
    }
    group.rotation.x = 0.5;
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.0004; } };
  };

  ICONS.orbit = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 24), new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.3, roughness: 0.4 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 12, 64), new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.5, roughness: 0.3 }));
    ring.rotation.x = Math.PI / 2.4;
    group.add(core, ring);
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.0005; ring.rotation.z = t * 0.0009; } };
  };

  ICONS.icosa = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(0.95, 0);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.3, roughness: 0.45, flatShading: true }));
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: SIGNAL }));
    group.add(mesh, wire);
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.00045; group.rotation.x = t * 0.0002; } };
  };

  ICONS.nodes = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const pts = [[0.65, 0.4, 0], [-0.6, 0.5, 0.3], [0, -0.6, -0.2], [0.5, -0.2, 0.5], [-0.5, -0.4, -0.4]].map((p) => new THREE.Vector3(...p));
    const nodeMat = new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.3, roughness: 0.4 });
    pts.forEach((p) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), nodeMat);
      sphere.position.copy(p);
      group.add(sphere);
    });
    const lineMat = new THREE.LineBasicMaterial({ color: COPPER, transparent: true, opacity: 0.55 });
    for (let i = 0; i < pts.length; i += 1) {
      for (let j = i + 1; j < pts.length; j += 1) {
        const geo = new THREE.BufferGeometry().setFromPoints([pts[i], pts[j]]);
        group.add(new THREE.Line(geo, lineMat));
      }
    }
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.0004; group.rotation.x = Math.sin(t * 0.0003) * 0.2; } };
  };

  ICONS.grid = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const matA = new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.35, roughness: 0.4 });
    const matB = new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.35, roughness: 0.4 });
    let idx = 0;
    [-0.42, 0.42].forEach((x) => {
      [-0.42, 0.42].forEach((y) => {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), idx % 2 ? matB : matA);
        cube.position.set(x, y, 0);
        group.add(cube);
        idx += 1;
      });
    });
    group.rotation.x = 0.5;
    group.rotation.y = 0.4;
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = 0.4 + t * 0.0003; } };
  };

  ICONS.link = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const geo = new THREE.TorusGeometry(0.55, 0.15, 16, 48);
    const t1 = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.4, roughness: 0.35 }));
    const t2 = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.4, roughness: 0.35 }));
    t1.position.x = -0.32;
    t1.rotation.y = Math.PI / 2.2;
    t2.position.x = 0.32;
    t2.rotation.x = Math.PI / 2.2;
    group.add(t1, t2);
    scene.add(group);
    return { scene, camera, update: (t) => { group.rotation.y = t * 0.0004; } };
  };

  ICONS.spark = () => {
    const scene = makeScene();
    const camera = makeCamera();
    const group = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.3, roughness: 0.35, emissive: 0x0f2b1d, emissiveIntensity: 0.6 })
    );
    group.add(core);
    const satMat = new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.4, roughness: 0.3 });
    const sats = [0, 1, 2].map(() => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), satMat);
      group.add(s);
      return s;
    });
    scene.add(group);
    return {
      scene,
      camera,
      update: (t) => {
        group.rotation.y = t * 0.0003;
        sats.forEach((s, i) => {
          const a = t * 0.0012 + i * ((Math.PI * 2) / 3);
          s.position.set(Math.cos(a) * 1.1, Math.sin(a * 1.3) * 0.4, Math.sin(a) * 1.1);
        });
      },
    };
  };

  ICONS.hero = () => {
    const scene = makeScene();
    const camera = makeCamera(6.4);
    const group = new THREE.Group();

    const coreGeo = new THREE.IcosahedronGeometry(1.05, 0);
    const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.35, roughness: 0.35, flatShading: true }));
    core.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreGeo), new THREE.LineBasicMaterial({ color: COPPER_LIGHT })));
    group.add(core);

    const satGeoms = [new THREE.OctahedronGeometry(0.42, 0), new THREE.TorusGeometry(0.36, 0.12, 12, 32), new THREE.TetrahedronGeometry(0.46, 0)];
    const sats = satGeoms.map((geo) => {
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: SIGNAL, metalness: 0.35, roughness: 0.4 }));
      group.add(mesh);
      return mesh;
    });

    const linkMat = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.4 });
    const links = sats.map(() => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), linkMat);
      group.add(line);
      return line;
    });

    scene.add(group);

    let autoY = 0;

    return {
      scene,
      camera,
      update: (t) => {
        autoY += 0.0026;
        const targetX = -pointer.y * 0.25;
        group.rotation.x += (targetX - group.rotation.x) * 0.05;
        group.rotation.y = autoY + pointer.x * 0.35;

        sats.forEach((s, i) => {
          const a = t * 0.00038 + i * ((Math.PI * 2) / 3);
          const radius = 2.0;
          s.position.set(Math.cos(a) * radius, Math.sin(a * 0.8) * 0.85, Math.sin(a) * radius);
          s.rotation.y = t * 0.0016;
          const pos = links[i].geometry.attributes.position;
          pos.setXYZ(0, 0, 0, 0);
          pos.setXYZ(1, s.position.x, s.position.y, s.position.z);
          pos.needsUpdate = true;
        });
      },
    };
  };

  /* ---------------- background particle field ---------------- */

  function initBackground() {
    const canvas = document.getElementById('bg-scene-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 40);
    camera.position.z = 12;

    const count = isSmallScreen ? 220 : 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: COPPER, size: 0.045, transparent: true, opacity: 0.55, sizeAttenuation: true });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const mat2 = new THREE.PointsMaterial({ color: SIGNAL, size: 0.035, transparent: true, opacity: 0.4, sizeAttenuation: true });
    const points2 = new THREE.Points(geo, mat2);
    points2.rotation.set(0.4, 0.6, 0);
    scene.add(points2);

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = document.visibilityState === 'visible';
      if (running) requestAnimationFrame(loop);
    });

    function loop(t) {
      if (!running) return;
      points.rotation.y = t * 0.00002;
      points2.rotation.y = -t * 0.000015;
      if (!prefersReducedMotion) {
        camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.02;
        camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      if (!prefersReducedMotion) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ---------------- 3D icons: native per-element canvases ----------------
     Each .icon3d IS a <canvas>, positioned by normal CSS layout like any
     other element. Because the browser scrolls it as part of the page's own
     compositor layer (not a JS-tracked overlay), there is no per-frame
     getBoundingClientRect()/scissor bookkeeping to fall behind during
     scroll — it is structurally immune to the lag that technique caused. */

  function initIcons() {
    const slots = Array.from(document.querySelectorAll('canvas.icon3d[data-icon]'));
    if (!slots.length) return;

    const registry = [];

    slots.forEach((canvas) => {
      const key = canvas.dataset.icon;
      if (!ICONS[key]) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch (err) {
        return; // context creation failed — leave the CSS fallback background visible
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setClearColor(0x000000, 0);

      const instance = ICONS[key]();
      registry.push({ canvas, renderer, ...instance, visible: true });
    });

    if (!registry.length) return;

    function resizeOne(entry) {
      const width = entry.canvas.clientWidth;
      const height = entry.canvas.clientHeight;
      if (width < 2 || height < 2) return;
      entry.renderer.setSize(width, height, false);
      entry.camera.aspect = width / height;
      entry.camera.updateProjectionMatrix();
    }

    registry.forEach(resizeOne);

    let resizePending = false;
    window.addEventListener('resize', () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        registry.forEach(resizeOne);
        resizePending = false;
      });
    });

    // Pause rendering for icons scrolled well out of view — saves GPU/battery
    // without needing to reposition anything (the canvas stays put natively).
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const entry = registry.find((r) => r.canvas === e.target);
            if (entry) entry.visible = e.isIntersecting;
          });
        },
        { rootMargin: '200px 0px 200px 0px' }
      );
      registry.forEach((entry) => io.observe(entry.canvas));
    }

    let running = true;
    document.addEventListener('visibilitychange', () => {
      running = document.visibilityState === 'visible';
      if (running) requestAnimationFrame(loop);
    });

    function loop(t) {
      if (!running) return;
      registry.forEach((entry) => {
        if (!entry.visible) return;
        entry.update(t);
        entry.renderer.render(entry.scene, entry.camera);
      });
      if (!prefersReducedMotion) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  function safeInit(fn, canvasId) {
    try {
      fn();
    } catch (err) {
      // Never let a WebGL failure block the page — hide the canvas and fall
      // back to the plain CSS look for whatever it was meant to render.
      const canvas = document.getElementById(canvasId);
      if (canvas) canvas.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      safeInit(initBackground, 'bg-scene-canvas');
      safeInit(initIcons);
    });
  } else {
    safeInit(initBackground, 'bg-scene-canvas');
    safeInit(initIcons);
  }
})();
