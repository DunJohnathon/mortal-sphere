document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/assets/data.json");
    const mapData = await response.json();

    const codeBlocks = document.querySelectorAll("pre > code.language-leaflet");
    if (codeBlocks === 0) return;

    let data;
    try {
      const res = await fetch("/assets/data.json")
      data = await res.json();
    } catch (err) {
      console.error("Could not load data.json", err);
      return;
    }
    
    codeBlocks.forEach((codeBlock, index) => {
      const config = jsyaml.load(codeBlock.innerText);
      const mapId = config.id;
      const image = config.image;
      const bounds = config.bounds;
      console.log('map: '+ index + ', mapId: '+mapId + ', image: ' + image + ', bounds: ' + bounds )
      const mapDiv = document.createElement("div");
      mapDiv.id = mapId;
      mapDiv.style = "width: 100%; height: 400px; margin: 1em 0;";
      codeBlock.parentElement.replaceWith(mapDiv);

      const map = L.map(mapId).setView(
       [config.lat, config.long],
       config.minZoom || config.maxZoom
       );

      L.imageOverlay('/assets/maps/' + image, bounds).addTo(map);

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
