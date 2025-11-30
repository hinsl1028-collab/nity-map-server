// server.js
const express = require('express');
const StaticMaps = require('staticmaps');
const path = require('path');

const app = express();
const PORT = 3000;

// OSM 타일 사용 (완전 무료, 키 필요 없음)
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

app.get('/map', async (req, res) => {
  try {
    const lon = parseFloat(req.query.lon);
    const lat = parseFloat(req.query.lat);
    const zoom = parseInt(req.query.zoom || '15', 10);
    const width = parseInt(req.query.w || '400', 10);
    const height = parseInt(req.query.h || '400', 10);

    if (isNaN(lon) || isNaN(lat)) {
      return res.status(400).send('Bad lon/lat');
    }

    console.log(`[Proxy] Request map lon=${lon}, lat=${lat}, zoom=${zoom}, w=${width}, h=${height}`);

    const options = {
      width: width,
      height: height,
      tileUrl: TILE_URL, // OSM 타일 서버
      tileSize: 256
    };

    const map = new StaticMaps(options);

    // center = [lon, lat]
    const center = [lon, lat];

    // 지도 렌더링
    await map.render(center, zoom);

    // PNG 버퍼로 가져오기
    const imageBuffer = await map.image.buffer('image/png');

    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (err) {
    console.error('[Proxy] render error:', err);
    res.status(500).send('Render error');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Map proxy server running on http://localhost:${PORT}`);
});
