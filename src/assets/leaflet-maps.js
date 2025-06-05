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

    var icon = L.icon({
      iconUrl: 'src/assets/icon.png',
      iconSize: [32,32],
      iconAnchor: [16,0],
      popupAnchor:  [-3, -32]
    });
    
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

      const map = L.map(mapId, {
                        crs: L.CRS.Simple,
                       minZoom: config.minZoom,
                       maxZoom: config.maxZoom}).fitBounds(bounds);

      L.imageOverlay('/assets/maps/' + image, bounds).addTo(map);

      // Add markers from data.json
      if (mapData.mapMarkers) {
        console.log('found json')
        mapData.mapMarkers.forEach((leafmap) => {
          if (leafmap.id === config.id) {
            console.log(leafmap.id+' matches '+ config.id)
            leafmap.markers.forEach((marker) => {
              L.marker([marker.loc[0], marker.loc[1]],
                       {icon: icon})
                .addTo(map)
                .bindPopup(marker.link || "");
          });
        }
      });
    } 
  });
}  catch (err) {
    console.error("Error rendering Leaflet map:", err);
  }
});
