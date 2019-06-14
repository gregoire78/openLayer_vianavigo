import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { v4 } from "uuid";

import OpenMap from "ol/Map";
import View from "ol/View";
//import Projection from "ol/proj/Projection";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { getWidth } from "ol/extent";
import { get as getProjection, transform, fromLonLat } from "ol/proj";
import TileWMS from "ol/source/TileWMS";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import TileGrid from "ol/tilegrid/TileGrid";

import { Vector as VectorLayer } from "ol/layer";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Icon, Style } from "ol/style";
//import WMSCapabilities from "ol/format/WMSCapabilities";
import "./styles.css";

function createStyle(src, img) {
  return new Style({
    image: new Icon(
      /** @type {module:ol/style/Icon~Options} */ ({
        anchor: [0.5, 0.96],
        crossOrigin: "anonymous",
        src: src,
        img: img,
        imgSize: img ? [img.width, img.height] : undefined
      })
    )
  });
}

//https://www.vianavigo.com/geoserver/geowebcacheServices/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&LAYERS=SCHEMA&WIDTH=512&HEIGHT=512&SRS=EPSG%3A102582&STYLES&BBOX=-7%2C88.50182033697399%2C271.249089831513%2C366.750910168487
//+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=0 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356515 +towgs84=-168,-60,320,0,0,0,0 +pm=paris +units=m +no_defs
function Map() {
  const [id] = useState(v4());

  useEffect(() => {
    proj4.defs(
      "EPSG:102582",
      "+proj=lcc +lat_1=46.8 +lat_0=46.8 +lon_0=2.337229166666667 +k_0=0.99987742 +x_0=600000 +y_0=2200000 +a=6378249.2 +b=6356514.999904194 +units=m +no_defs"
    );
    register(proj4);
    getProjection("EPSG:102582").setExtent(
      /*[
        -690.9661671323342,
        -39.53016713233433,
        1359.7323342646685,
        1327.6021671323342
      ]*/ [
        -7,
        -39.920836508339676,
        1362.8416730166794,
        645
      ]
    );

    var startResolution =
      getWidth(getProjection("EPSG:102582").getExtent()) / 512;
    var resolutions = new Array(10);
    for (var i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }
    console.log(resolutions);

    var iconFeature = new Feature(new Point([63.551, 269.502]));
    iconFeature.set(
      "style",
      createStyle(
        "https://openlayers.org/en/latest/examples/data/icon.png",
        undefined
      )
    );

    const map = new OpenMap({
      target: id,
      layers: [
        /*new TileLayer({
          source: new OSM()
        }),*/
        new TileLayer({
          transition: 0,
          extent: getProjection("EPSG:102582").getExtent(),
          source: new TileWMS({
            attributions: ["Vianavigo"],
            url: "https://www.vianavigo.com/geoserver/geowebcacheServices/wms",
            params: {
              LAYERS: "SCHEMA",
              FORMAT: "image/png",
              VERSION: "1.1.1"
            },
            serverType: "geoserver",
            projection: getProjection("EPSG:102582"),
            tileGrid: new TileGrid({
              resolutions: [
                1.3350901701803404,
                0.5434552535771738,
                0.2717276267885869,
                0.13573152146304293
              ],
              minZoom: 0,
              extent: getProjection("EPSG:102582").getExtent(),
              tileSize: [512, 512]
            })
          })
        }),
        new VectorLayer({
          style: function(feature) {
            return feature.get("style");
          },
          source: new VectorSource({ features: [iconFeature] })
        })
      ],
      view: new View({
        //extent: [-180.0, -90.0, 180.0, 90.0],
        center: [63.551, 269.502],
        zoom: 1,
        maxZoom: 3,
        minZoom: 0,
        //zoomFactor: 2,
        resolutions: [
          1.3350901701803404,
          0.5434552535771738,
          0.2717276267885869,
          0.13573152146304293
        ],
        projection: getProjection("EPSG:102582")
      })
    });
    map.on("click", () => map.getView());
    console.log(map.getView().getZoom());
  });
  return <div id={id} />;
}

function App() {
  return (
    <div className="App">
      <Map />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
