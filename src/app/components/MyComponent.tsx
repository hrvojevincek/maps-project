import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "800px",
  height: "800px",
};

function MyComponent() {
  //! FINDING USER LOCATION
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

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    libraries: ["places"],
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // !application
  const [map, setMap] = React.useState(null);
  const [center, setCenter] = useState({ lat: 51.525, lng: -0.06 });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // !LOADINGMAP
  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map);
  }, []);

  // !FINDING RESTAURANTS
  useEffect(() => {
    if (isLoaded && center) {
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: center,
        radius: "1000", // You can adjust this value
        type: ["restaurant", "food"],
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

  // !CALCULATIN DISTANCE
  const [distances, setDistances] = useState([]);
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);

  let distanceMatrixService;
  let directionsService;

  if (isLoaded) {
    distanceMatrixService = new google.maps.DistanceMatrixService();
    directionsService = new google.maps.DirectionsService();
  }

  function computeDistances(myLatLng, destinations) {
    const distanceMatrixService = new google.maps.DistanceMatrixService();

    distanceMatrixService.getDistanceMatrix(
      {
        origins: [myLatLng],
        destinations: destinations,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (response, status) => {
        console.log(response);
        if (status === google.maps.DistanceMatrixStatus.OK) {
          setDistances(response.rows[0].elements);
        } else {
          setError("Error fetching distances");
        }
      }
    );
  }

  function fetchAndRenderDirections(myLatLng, destinationLatLng) {
    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: myLatLng,
      destination: destinationLatLng,
      travelMode: google.maps.TravelMode.WALKING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        setError("Error fetching directions");
      }
    });
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then(function (result) {
          if (result.state === "prompt") {
            navigator.geolocation.getCurrentPosition(success, errors, options);
          } else if (result.state === "denied") {
            console.log("denied access");
          }
        });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
    if (isLoaded && restaurants.length) {
      const destinations = restaurants.map((r) => r.geometry.location);
      computeDistances(center, destinations);
    }
  }, [isLoaded, restaurants, center, map]);

  const onMarkerClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchAndRenderDirections(center, restaurant.geometry.location);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerClassName="z-1"
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <Marker icon={userLocationIcon} position={center} />
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.place_id}
          position={restaurant.geometry.location}
          onClick={() => onMarkerClick(restaurant)}
          icon={restaurantIcon}
        />
      ))}

      {directions && <DirectionsRenderer map={map} directions={directions} />}

      {selectedRestaurant && (
        <InfoWindow
          options={{
            pixelOffset: new window.google.maps.Size(0, -40),
          }}
          position={selectedRestaurant.geometry.location}
          onCloseClick={() => setSelectedRestaurant(null)}
        >
          <div className="text-black">
            <h2>{selectedRestaurant.name}</h2>
            {selectedRestaurant.vicinity && (
              <p>{selectedRestaurant.vicinity}</p>
            )}
            {distances.length && (
              <p>
                Distance from you:{" "}
                {
                  distances[restaurants.indexOf(selectedRestaurant)].distance
                    .text
                }
              </p>
            )}
          </div>
        </InfoWindow>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MyComponent);
