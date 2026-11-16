// Liquid Glass for Chromium renders.
// Each .glass element gets its own SVG filter: blur + saturation of the backdrop,
// then a displacement map built from the element's rounded-rect shape, so the
// backdrop bends like a lens near the edges and stays flat in the middle.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const host = document.createElementNS(NS, 'svg');
  host.setAttribute('width', '0');
  host.setAttribute('height', '0');
  host.style.position = 'absolute';
  document.body.appendChild(host);

  // Signed distance from a point to a rounded rect (negative inside).
  function sdRoundRect(x, y, w, h, r) {
    const qx = Math.abs(x - w / 2) - (w / 2 - r);
    const qy = Math.abs(y - h / 2) - (h / 2 - r);
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    return Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r;
  }

  // Displacement map: R = x offset, G = y offset, 128 = none.
  // Offset points outward along the edge normal, growing towards the rim
  // (squared falloff), so content near the edge is pulled in = lens bend.
  function buildMap(w, h, r, bezel, ss) {
    const W = Math.round(w * ss), H = Math.round(h * ss);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(W, H);
    const e = 0.5;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        const x = (i + 0.5) / ss, y = (j + 0.5) / ss;
        const d = sdRoundRect(x, y, w, h, r);
        let dx = 0, dy = 0;
        const t = Math.min(Math.max(1 + d / bezel, 0), 1); // 0 inside flat area, 1 at rim
        if (t > 0) {
          const nx = sdRoundRect(x + e, y, w, h, r) - sdRoundRect(x - e, y, w, h, r);
          const ny = sdRoundRect(x, y + e, w, h, r) - sdRoundRect(x, y - e, w, h, r);
          const len = Math.hypot(nx, ny) || 1;
          const k = t * t;
          dx = -(nx / len) * k;
          dy = -(ny / len) * k;
        }
        const p = (j * W + i) * 4;
        img.data[p] = 128 + dx * 127;
        img.data[p + 1] = 128 + dy * 127;
        img.data[p + 2] = 128;
        img.data[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  let n = 0;
  window.applyGlass = function (root = document) {
    root.querySelectorAll('.glass').forEach((el) => {
      const cs = getComputedStyle(el);
      const w = el.offsetWidth, h = el.offsetHeight;
      const r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2);
      const bezel = parseFloat(cs.getPropertyValue('--bezel')) || Math.min(r, 16);
      const strength = parseFloat(cs.getPropertyValue('--refract')) || 18;
      const blur = parseFloat(cs.getPropertyValue('--blur')) || 2;
      const sat = parseFloat(cs.getPropertyValue('--sat')) || 1.6;
      const id = 'lg' + n++;
      const f = document.createElementNS(NS, 'filter');
      f.setAttribute('id', id);
      f.setAttribute('x', '0'); f.setAttribute('y', '0');
      f.setAttribute('width', w); f.setAttribute('height', h);
      f.setAttribute('filterUnits', 'userSpaceOnUse');
      f.setAttribute('primitiveUnits', 'userSpaceOnUse');
      f.setAttribute('color-interpolation-filters', 'sRGB');
      f.innerHTML = `
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" edgeMode="duplicate" result="b"/>
        <feColorMatrix in="b" type="saturate" values="${sat}" result="s"/>
        <feImage href="${buildMap(w, h, r, bezel, 2)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>
        <feDisplacementMap in="s" in2="m" scale="${strength * 2}" xChannelSelector="R" yChannelSelector="G"/>`;
      host.appendChild(f);
      el.style.backdropFilter = `url(#${id})`;
    });
  };
})();
