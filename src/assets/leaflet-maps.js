document.addEventListener("DOMContentLoaded", async () => {
  try {
    
  
    const codeBlocks = document.querySelectorAll("pre > code.language-leaflet");
    if (codeBlocks === 0) return;

     async function findNoteUrlBySlug(slug) {
      const sitemapUrl = '/sitemap.xml';
      const res = await fetch(sitemapUrl);
      const xmlText = await res.text();
       console.log(xmlText)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
       console.log(xmlDoc)

      const urls = Array.from(xmlDoc.querySelectorAll('url > loc')).map(el => el.textContent);

      const matched = urls.find(url => url.includes(`/${slug}/`));

      return matched || null;
    }
    
    const response = await fetch("/assets/data.json");
    const mapData = await response.json(); 
    console.log(mapData)
    
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
      mapDiv.style = `width: ${config.width}; height: ${config.height}; margin: 1em 0;`;
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

              findNoteUrlBySlug(slug).then(url => {
                if (url) {
                  console.log("Found note URL:", url);
                  L.marker([marker.loc[0], marker.loc[1]],
                       {icon: icon}, {title: marker.link})
                .addTo(map)
                .bindTooltip(marker.link, {
                  direction: "top",
                  offset: [0, -10]
                  })
                .on("click", () => {
                  window.location.href = url;
                });
                } else {
                  console.log("Note not found.");
                }
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
