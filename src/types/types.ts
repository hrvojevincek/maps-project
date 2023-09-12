export type LatLng = {
  lat: number;
  lng: number;
};

export type Restaurant = {
  place_id: string;
  geometry: {
    location: LatLng;
  };
};

export type DistanceElement = {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
};

export type Directions = {
  routes: any[];
};

export interface MyComponentState {
  map: google.maps.Map | null; // using google.maps.Map type if you have @types/googlemaps installed
  center: LatLng;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  distances: DistanceElement[];
  directions: Directions | null;
  error: string | null;
}
