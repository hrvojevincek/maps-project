"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  LatLng,
  Restaurant,
  DistanceElement,
  Directions,
} from "../../types/types";
import DirectionsRender from "./DirectionsRender";
import UserLocationMarker from "./UserLocationMarker";

const containerStyle = {
  width: "800px",
  height: "800px",
};

const libraries = ["places"];

const GoogleMapRenders: React.FC = () => {
  // !application
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<LatLng>({ lat: 51.525, lng: -0.06 });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  // !LOADINGMAP
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    libraries,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const memoizedLoaded = useMemo(() => isLoaded, [isLoaded]);

  //! FINDING USER LOCATION
  function success(pos: GeolocationPosition) {
    var crd = pos.coords;
    setCenter({ lat: crd.latitude, lng: crd.longitude });
    // console.log("Your current position is:");
    // console.log(`Latitude : ${crd.latitude}`);
    // console.log(`Longitude: ${crd.longitude}`);
    // console.log(`More or less ${crd.accuracy} meters.`);
  }

  function errors(err: GeolocationPositionError) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  // !FINDING RESTAURANTS
  useEffect(() => {
    if (memoizedLoaded && center && map) {
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: center,
        radius: 2000,
        type: "restaurant",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setRestaurants(results.slice(0, 10));
        } else {
          console.error("PlacesService error:", status);
        }
      });
    }
  }, [center, memoizedLoaded, map]);

  const restaurantIcon =
    "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

  // !CALCULATIN DISTANCE
  const [distances, setDistances] = useState<DistanceElement[]>([]);
  const [directions, setDirections] = useState<Directions | null>(null);
  const [error, setError] = useState<string | null>(null);

  let distanceMatrixService;
  let directionsService;

  if (memoizedLoaded) {
    distanceMatrixService = new google.maps.DistanceMatrixService();
    directionsService = new google.maps.DirectionsService();
  }

  function computeDistances(myLatLng: LatLng, destinations: LatLng[]) {
    const distanceMatrixService = new google.maps.DistanceMatrixService();

    distanceMatrixService.getDistanceMatrix(
      {
        origins: [myLatLng],
        destinations: destinations,
        travelMode: google.maps.TravelMode.WALKING,
      },

      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          if (response) {
            setDistances(response.rows[0].elements);
          }
        } else {
          setError("Error fetching distances");
        }
      }
    );
  }

  function fetchAndRenderDirections(
    myLatLng: LatLng,
    destinationLatLng: LatLng
  ) {
    const directionsService = new google.maps.DirectionsService();

    const request: google.maps.DirectionsRequest = {
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
    var options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

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

    if (memoizedLoaded && restaurants.length) {
      const destinations = restaurants.map((r) => r.geometry.location);
      computeDistances(center, destinations);
    }
  }, [memoizedLoaded, restaurants, center, map]);

  const onMarkerClick = (restaurant: Restaurant) => {
    setDistances(distances);
    setSelectedRestaurant(restaurant);
    fetchAndRenderDirections(center, restaurant.geometry.location);
  };

  const userLocationIcon = {
    fillOpacity: 2,
    strokeWeight: 2,
    scale: 0.3,
  };

  return memoizedLoaded ? (
    <GoogleMap
      mapContainerClassName="z-1"
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      onLoad={onLoad}
    >
      <UserLocationMarker icon={userLocationIcon} position={center} />

      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.place_id}
          position={restaurant.geometry.location}
          onClick={() => onMarkerClick(restaurant)}
          icon={restaurantIcon}
        />
      ))}

      {directions && <DirectionsRender directions={directions} />}

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
            <p>{selectedRestaurant?.vicinity}</p>
            {distances.length > 0 &&
            selectedRestaurant &&
            distances[restaurants.indexOf(selectedRestaurant)] &&
            distances[restaurants.indexOf(selectedRestaurant)].distance ? (
              <p>
                Distance from you:
                {distances[restaurants.indexOf(selectedRestaurant)].distance
                  .text || "N/A"}
              </p>
            ) : null}
            <p>
              Time to reach (by walking):{" "}
              {
                distances[restaurants.indexOf(selectedRestaurant)]?.duration
                  .text
              }
            </p>
          </div>
        </InfoWindow>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}
    </GoogleMap>
  ) : (
    <></>
  );
};

export default React.memo(GoogleMapRenders);
