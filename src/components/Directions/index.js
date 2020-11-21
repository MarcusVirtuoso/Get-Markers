import React from 'react';
import MapViewDirections from 'react-native-maps-directions';

const Directions = ({ destination, origin, onReady}) => (
    <MapViewDirections
        destination={destination}
        origin={origin}
        onReady={onReady}
        apikey="AIzaSyBT_OyI5VK5tBMVEGfLa9cPfv-LIX9Sqb0"
        strokeWidth={3}
        strokeColor="#A1AF66"
    />
);

export default Directions