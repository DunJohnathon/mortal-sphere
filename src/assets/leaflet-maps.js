document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/assets/data.json");
    const mapData = await response.json();

    const codeBlocks = document.querySelectorAll("pre > code.language-leaflet");
    if (codeBlocks === 0) return;
    
    codeBlocks.forEach((codeBlock, index) => {
      const config = jsyaml.load(codeBlock.innerText);
      const mapId = config.id;

      const mapDiv = document.createElement("div");
      mapDiv.id = mapId;
      mapDiv.style = "width: 100%; height: 400px; margin: 1em 0;";
      codeBlock.parentElement.replaceWith(mapDiv);

//      const map = L.map(mapId).setView(
//        [config.latitude, config.longitude],
//        config.zoom || 10
//      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Add markers from data.json
      if (mapData.mapMarkers) {
        mapData.mapMarkers.forEach((marker) => {
          if (marker.mapId === config.id) {
            L.marker([marker.latitude, marker.longitude])
              .addTo(map)
              .bindPopup(marker.popup || "");
          }
        });
      }
    });
  } catch (err) {
    console.error("Error rendering Leaflet map:", err);
  }
});
