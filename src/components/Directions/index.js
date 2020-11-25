import React from 'react';
import MapViewDirections from 'react-native-maps-directions';

const Directions = ({ destination, origin, onReady}) => (
    <MapViewDirections
        destination={destination}
        origin={origin}
        onReady={onReady}
        apikey="API_MAP_KEY"
        strokeWidth={3}
        strokeColor="#A1AF66"
    />
);

export default Directions
