import React, { memo } from "react";
import { DirectionsRenderer } from "@react-google-maps/api";

interface Props {
  directions: any;
}

const DirectionsRendererComponent: React.FC<Props> = ({ directions }) => (
  <DirectionsRenderer
    directions={directions}
    options={{ preserveViewport: true }}
  />
);

export default memo(DirectionsRendererComponent);
