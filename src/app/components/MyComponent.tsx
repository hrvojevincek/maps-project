import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "800px",
  height: "800px",
};

function MyComponent() {
  const [map, setMap] = React.useState(null);
  const [center, setCenter] = useState({ lat: 51.525, lng: -0.06 });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  function success(pos: any) {
    var crd = pos.coords;
    setCenter({ lat: crd.latitude, lng: crd.longitude });
    // console.log("Your current position is:");
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
  }

  function errors(err: any) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "granted") {
            //If granted then you can directly call your function here
          } else if (result.state === "prompt") {
            const position = navigator.geolocation.getCurrentPosition(
              success,
              errors,
              options
            );
            console.log(result);
          } else if (result.state === "denied") {
            //If denied then you have to show instructions to enable location
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    libraries: ["places"],
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const onLoad = React.useCallback(function callback(map: any) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: any) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (isLoaded && center) {
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: center,
        radius: "1000", // You can adjust this value
        type: ["restaurant"],
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setRestaurants(results.slice(0, 15)); // Get the top 10 results
        }
      });
    }
  }, [center, isLoaded, map]);

  const restaurantIcon =
    "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

  const userLocationIcon = {
    fillOpacity: 2,
    strokeWeight: 2,
    scale: 0.3,
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerClassName="z-1"
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <Marker icon={userLocationIcon} position={center} />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.place_id}
          position={restaurant.geometry.location}
          onClick={() => setSelectedRestaurant(restaurant)}
          icon={restaurantIcon}
        />
      ))}
      {selectedRestaurant && (
        <InfoWindow
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
          }}
          position={selectedRestaurant.geometry.location}
          onCloseClick={() => setSelectedRestaurant(null)}
        >
          <div className="text-black">
            <p>{selectedRestaurant.name}</p>
            {selectedRestaurant.vicinity && (
              <p>{selectedRestaurant.vicinity}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MyComponent);
