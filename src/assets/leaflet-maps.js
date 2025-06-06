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
      iconUrl: '/assets/icon.png',
      iconSize: [16,24],
      iconAnchor: [8,12],
      popupAnchor:  [0, -10]
    });
    
    codeBlocks.forEach((codeBlock, index) => {
      const config = jsyaml.load(codeBlock.innerText);
      const mapId = config.id;
      const image = config.image;
      const bounds = config.bounds;
      console.log('map: '+ index + ', mapId: '+mapId + ', image: ' + image + ', bounds: ' + bounds )
      const mapDiv = document.createElement("div");
      mapDiv.id = mapId;
      mapDiv.style = "width: ${config.width}; height: ${config.height}; margin: 1em 0;";
      codeBlock.parentElement.replaceWith(mapDiv);

      console.log(`width: ${config.width}; height: ${config.height}; margin: 1em 0;`)
      const map = L.map(mapId, {
                        crs: L.CRS.Simple,
                       minZoom: config.minZoom,
                       maxZoom: config.maxZoom,
                        height: config.height,
                        width: config.width})
        .fitBounds(bounds);

      L.imageOverlay('/assets/maps/' + image, bounds).addTo(map);

      // Add markers from data.json
      if (mapData.mapMarkers) {
        console.log('found json')
        mapData.mapMarkers.forEach((leafmap) => {
          if (leafmap.id === config.id) {
            console.log(leafmap.id+' matches '+ config.id)
            leafmap.markers.forEach((marker) => {
              const slug = marker.link
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");
              const noteUrl = 'https://mortal-sphere.pages.dev/'+slug
              
              L.marker([marker.loc[0], marker.loc[1]],
                       {icon: icon}, {title: marker.link})
                .addTo(map)
                .bindTooltip(marker.link, {
                  direction: "top",
                  offset: [0, -10]
            })
                .on("click", () => {
                  window.location.href = noteUrl;
                });
          });
        }
      });
    } 
  });
}  catch (err) {
    console.error("Error rendering Leaflet map:", err);
  }
});
