import React, { memo } from "react";
import { Marker } from "@react-google-maps/api";

interface Props {
  restaurant: any;
  onClick: () => void;
  icon: string;
}

const RestaurantMarker: React.FC<Props> = ({ restaurant, onClick, icon }) => (
  <Marker
    key={restaurant.place_id}
    position={restaurant.geometry.location}
    onClick={onClick}
    icon={icon}
  />
);

export default memo(RestaurantMarker);
