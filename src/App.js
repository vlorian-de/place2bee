import React, { useEffect, useState, useMemo, useRef } from "react";
import GoogleMapReact from "google-map-react";
import "./styles.css";

const INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com";
const READ_TOKEN =
  "ELOH2TiUcctW0wmlDNm3bcGG2q0ZmYaARHCLgrvhztkfV6AqjPD4FYuq8KrvpNEa75XNV8EiG6WrImFFwC2H3A==";

function generateMarkerJsons(csvResult) {
  const lines = csvResult.split("\r\n").filter((line) => line.length > 0);
  const [tableHeader, ...entries] = lines;
  const junks = splitInJunks(entries, 4);
  return junks.map((junk) => {
    const pairs = junk.map((entry) => {
      const entryArray = entry.split(",");
      const [
        start,
        unknown,
        index,
        time1,
        time2,
        time3,
        value,
        key,
        boxKey,
        boxNumber
      ] = entryArray;
      return { [key]: value };
    });
    return pairs;
  });
}

function splitInJunks(inputArray, perChunk) {
  const result = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
  return result;
}

const Marker = ({ children }) => children;
const App = () => {
  const mapRef = useRef();

  const [queryResult, setQueryResult] = useState([]);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const fetchQueryResult = async () => {
      try {
        const response = await fetch(`${INFLUX_URL}/api/v2/query`, {
          method: "POST",
          headers: {
            Authorization: `Token ${READ_TOKEN}`,
            Accept: "application/json",
            "Content-type": "application/vnd.flux"
          },
          body: 'from(bucket:"log") |> range(start:-30d)'
        });

        if (response.ok) {
          const result = await response.text();
          let json = generateMarkerJsons(result);
          console.log("###result", result, json);
          setQueryResult(json);
        } else {
          console.error("Error fetching query result:", response.status);
        }
      } catch (error) {
        console.error("Error fetching query result:", error);
      }
    };

    fetchQueryResult();
  }, []);

  const queryResult2 = queryResult.map((qr) => ({ zoom: zoom, ...qr }));

  return (
    <div>
      Wo sind die Bienen?
      <div style={{ height: "100vh", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "" }}
          defaultCenter={{ lat: 48.62670530986592, lng: 9.338316612329077 }}
          defaultZoom={18}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
          onChange={({ zoom, bounds }) => {
            setZoom(zoom);
            // setBounds([
            //   bounds.nw.lng,
            //   bounds.se.lat,
            //   bounds.se.lng,
            //   bounds.nw.lat
            // ]);
          }}
        >
          {queryResult2.map(({ long, lat }) => (
            <Marker key={`cluster${long}`} lng={long} lat={lat}>
              <div className="well-marker">B</div>
            </Marker>
          ))}
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default App;
