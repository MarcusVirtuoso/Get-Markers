import React, { useState } from 'react';
//import { View, StyleSheet } from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

function Search({ onLocationSelected }) {
  const [searchFocused, setSearchFocused] = useState(false);
  
	return (
	  <GooglePlacesAutocomplete
	 	placeholder= "Para onde?"
		placeholderTextColor="#333"
		query={{
		  key: 'AIzaSyBT_OyI5VK5tBMVEGfLa9cPfv-LIX9Sqb0',
		  language: "pt",
		}}
		onPress={onLocationSelected}
		textInputProps={{
		  onFocus: () => {
			setSearchFocused(true);
		  },
		  onBlur: () => {
			setSearchFocused(false);
		  },
		  autoCapitalize: "none",
		  autoCorrect: false,
		}}
		listViewDisplayed={searchFocused}
		fetchDetails
		enablePoweredByContainer={false}
      styles={{
        container: {
          position: "absolute",
          top: Platform.select({ ios: 60, android: 20 }),
          width: "100%",
        },
        textInputContainer: {
          flex: 1,
          backgroundColor: "transparent",
          height: 54,
          marginHorizontal: 20,
          borderTopWidth: 0,
          borderBottomWidth: 0,
        },
        textInput: {
          height: 54,
          margin: 0,
          borderRadius: 10,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 20,
          paddingRight: 20,
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { x: 0, y: 0 },
          shadowRadius: 15,
          borderWidth: 1,
          borderColor: "#DDD",
          fontSize: 18,
        },
        listView: {
          borderWidth: 1,
          borderColor: "#DDD",
          backgroundColor: "#FFF",
          marginHorizontal: 20,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { x: 0, y: 0 },
          shadowRadius: 15,
          marginTop: 10,
        },
        description: {
          fontSize: 15,
        },
        row: {
          padding: 20,
          height: 58,
        },
    }}
    // TODO - Corrigir currentLocation depois
    // currentLocation={true}
    currentLocationLabel="Localização atual"
    nearbyPlacesAPI="GooglePlacesSearch"
    //GoogleReverseGeocodingQuery={
    //  {
    //    // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
    //  }
    //}
    //GooglePlacesSearchQuery={{
    //  rankby: 'distance',
    //  types: 'food',
    //}}
    //filterReverseGeocodingByTypes={[
    //  'locality',
    //  'administrative_area_level_3',
    //]}
    debounce={200}
	  />
	);
  }
export default Search;