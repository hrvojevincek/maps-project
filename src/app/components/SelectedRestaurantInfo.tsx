import React, { memo } from "react";
import { InfoWindow } from "@react-google-maps/api";

interface Props {
  restaurant: any;
  distances: any[];
}

const SelectedRestaurantInfo: React.FC<Props> = ({ restaurant, distances }) => {
  // Get the index and distance details for the selected restaurant
  const distanceIndex = distances.findIndex(
    (d) => d.place_id === restaurant.place_id
  );
  const distanceDetails = distances[distanceIndex];

  const distanceText = distanceDetails?.distance?.text || "N/A";
  const durationText = distanceDetails?.duration?.text || "N/A";

  return (
    <InfoWindow
      options={{
        pixelOffset: new window.google.maps.Size(0, -40),
      }}
      position={restaurant.geometry.location}
    >
      <div className="text-black">
        <h2>{restaurant.name}</h2>
        <p>{restaurant.vicinity}</p>
        <p>Distance from you: {distanceText}</p>
        <p>Time to reach (by walking): {durationText}</p>
      </div>
    </InfoWindow>
  );
};

export default memo(SelectedRestaurantInfo);
