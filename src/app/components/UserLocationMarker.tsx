import React, { memo } from "react";
import { Marker } from "@react-google-maps/api";

interface Props {
  position: { lat: number; lng: number };
  icon: any;
}

const UserLocationMarker: React.FC<Props> = ({ position, icon }) => (
  <Marker icon={icon} position={position} />
);

export default memo(UserLocationMarker);
