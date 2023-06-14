import {
  GoogleMap,
  InfoWindow,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { useState, useMemo } from "react";
import "../App.css";

const Singapore = { lat: 1.3521, lng: 103.8198 };

// the json data which will be mapped out to render the markers
const jsonData = [
  {
    location: {
      latitude: 1.3521,
      longitude: 103.8198,
    },
    dollarAmount: 5,
  },
  {
    location: {
      latitude: 1.2806,
      longitude: 103.8505,
    },
    dollarAmount: 50,
  },
  {
    location: {
      latitude: 1.2903,
      longitude: 103.8515,
    },
    dollarAmount: 500,
  },
  {
    location: {
      latitude: 1.3187,
      longitude: 103.8444,
    },
    dollarAmount: 5000,
  },
];

// paths to icons to mark expenses on the map
const markerImages = [
  "https://i.imgur.com/7cK1OS9.png",
  "https://i.imgur.com/WcjaOHE.png",
  "https://i.imgur.com/jdBvHmU.png",
  "https://i.imgur.com/Z83u9o9.png",
];

// function to assign an icon to display based on the dollar amount
function getDollarAmountCategory(dollarAmount) {
  if (dollarAmount < 10) return 0;
  if (dollarAmount < 100) return 1;
  if (dollarAmount < 1000) return 2;
  return 3;
}

const onLoad = (map) => {
  const bounds = new google.maps.LatLngBounds();
  jsonData?.forEach();
  map.fitBounds(bounds);
};

const Map = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
  });

  // const [mapRef, setMapRef] = useState();
  // const [isOpen, setIsOpen] = useState(false);
  // const [infoWindowData, setInfoWindowData] = useState();

  const center = useMemo(() => Singapore, []);

  // const onMapLoad = (map) => {
  //   setMapRef(map);
  //   const bounds = new google.maps.LatLngBounds();
  //   markers?.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
  //   map.fitBounds(bounds);
  // };

  // const handleMarkerClick = (id, lat, lng, address) => {
  //   mapRef?.panTo({ lat, lng });
  //   setInfoWindowData({ id, address });
  //   setIsOpen(true);
  // };

  return (
    <div className="map-container">
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap mapContainerClassName="map" center={center} zoom={11}>
          {jsonData.map((item, index) => (
            <MarkerF
              key={index}
              position={{
                lat: item.location.latitude,
                lng: item.location.longitude,
              }}
              icon={markerImages[getDollarAmountCategory(item.dollarAmount)]}
            />
          ))}
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;
