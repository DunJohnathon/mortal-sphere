document.addEventListener("DOMContentLoaded", () => {
  const codeBlocks = document.querySelectorAll("pre > code.language-leaflet");

  codeBlocks.forEach((codeBlock, index) => {
    try {
      const config = jsyaml.load(codeBlock.innerText);
      const mapId = `leaflet-map-${index}`;

      const mapDiv = document.createElement("div");
      mapDiv.id = mapId;
      mapDiv.style = "width: 100%; height: 400px; margin: 1em 0;";
      codeBlock.parentElement.replaceWith(mapDiv);

      const map = L.map(mapId).setView(
        [config.latitude, config.longitude],
        config.zoom || 10
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      if (config.markers) {
        config.markers.forEach((marker) => {
          L.marker([marker.latitude, marker.longitude])
            .addTo(map)
            .bindPopup(marker.popup || "");
        });
      }
    } catch (err) {
      console.error("Error rendering Leaflet map:", err);
    }
  });
});
