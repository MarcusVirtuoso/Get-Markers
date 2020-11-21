import React, { Fragment} from 'react';
import { View, Text, StyleSheet,  Modal, TouchableHighlight, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Search from '../Search';
import Directions from '../Directions';
import Record from '../Record';
import { getPixelSize } from '../../utils';

import * as firebase from 'firebase';
import * as geofirestore from 'geofirestore';

var locationsP = []

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _isMounted: false,
      region: null,
      destination: null,
      currentLongitude: 0,
      currentLatitude: 0,
      markers: [],
      places: [],
      details: null,
      modalVisible: false,
      pDuration: null,
      pDistance: null,
    };
    this.handlePress = this.handlePress.bind(this);
  }

  componentDidMount =  () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        let long = parseFloat(position.coords.longitude);
        let lat = parseFloat(position.coords.latitude);
          console.log(long);
          console.log(lat);
				this.setState({
					region: {
            longitude: long,
            latitude: lat,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
					}
				});
      },
      error => alert(JSON.stringify(error.message)),
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 10000 },this.mapView
    );
    this.setState({_isMounted: true})
  };

  componentWillUnmount() {
    this.setState({_isMounted: false})
  }

  getPointName = (lat, lng) => {
    console.log(lat, lng);
    let adressName = ""
    Geocoder.init("AIzaSyBT_OyI5VK5tBMVEGfLa9cPfv-LIX9Sqb0", {language: "pt"});
    Geocoder.from(lat, lng).then(
      json => {
        fullAdressName = json.results[0].formatted_address;
        adressName = fullAdressName.substr(0, fullAdressName.indexOf('-'));
        this.setState({
          details: {
            lat, lng, adressName
          }
        })
      },
      error => {
        console.log(error);
      }
    );
  }
  
	handleLocationSelected = (data, details) => {
    const { location: { lat: latitude, lng: longitude }} = details.geometry
    this.setState({
			destination: {
				latitude, 
				longitude,
				title: data.structured_formatting.main_text,
			},
		})
	}
  
  handlePress(e){
    console.log(e.nativeEvent)
    this.setState({
      markers: [
        ...this.state.markers,
        { coordinate: e.nativeEvent.coordinate, }
      ], modalVisible: true
    });
    this.getPointName(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)
  }
  
  _showModal = () => this.setState({ modalVisible: true })
 
  _hideModal = () => this.setState({ modalVisible: false, details: null })
 

  async getLocationsDatabase(){
    if (this.state.region !== null) {
      const lat = this.state.region.latitude
      const lng = this.state.region.longitude

      const firestore = firebase.firestore();        
      const GeoFirestore = geofirestore.initializeApp(firestore);        
      const geocollection = GeoFirestore.collection('locations');
      const query = geocollection.near(
        { center: new firebase.firestore.GeoPoint(
          lat, 
          lng
          ), radius: 10
        });

        try {
          const locations = await query.get();
          var dataPoint = null;
          locations.forEach(doc => 
            {
              dataPoint = {
              id: doc.id,
              latitude: doc.data().coordinates.latitude,
              longitude: doc.data().coordinates.longitude,
              title: doc.data().name,
              }
              if(locationsP.find(item => item.id === dataPoint.id)===undefined){
               locationsP.push(dataPoint);
               }
              });
        } catch (err) {
          console.log(err);
        }
        this.showPointOnMap()
    }
  }

  showPointOnMap = () => {
    this.setState({
      places: locationsP,
    })
  }

  render() {
		const { region, destination, details= null, modalVisible } = this.state;
    return (
      <View style={styles.container}>
        <MapView
          accessible={false}
          style={styles.map}
					initialRegion={region}
					showsUserLocation
          loadingEnabled
          ref = {el => this.mapView = el}
          onPress={this.handlePress}
					>
						{ destination && (
              <Fragment>
                <Directions
                  origin={region}
                  destination={destination}
                  onReady={(result) => {
                    this.setState({
                      pDistance: result.distance,
                      pDuration: result.duration,
                    })
                    console.log(`Distance: ${result.distance} km`)
                    console.log(`Duration: ${result.duration} min.`)
                    
                    this.mapView.fitToCoordinates(result.coordinates,{
                      edgePadding:{
                        right: getPixelSize(30),
                        left: getPixelSize(30),
                        top: getPixelSize(30),
                        bottom: getPixelSize(30),
                      }
                    });                    
                  }}
                />
                  <MapView.Marker coordinate={destination} />
              </Fragment>
						  )
            }
          {/* PONTOS JA GRAVADOS NO MAPA */}
          {this.state.markers.map((marker) => {            
            return (
            <Marker key={marker.coordinate.latitude} onPress={this._showModal}
              {...marker} 
            />
            )})}

          {/* PONTOS DE GRAVACAO DO MAPA */}
          {this.state.places.map((place) => {
            this.mapView
            return(
              <MapView.Marker 
              key={place.id}
              coordinate={{latitude: place.latitude, longitude: place.longitude}} 
              />
          )})}
            
        </MapView>
        {details
          ? <Modal animationType="slide" transparent={true} visible={modalVisible} >
              <Record location={details} />
              <View style={styles.modalContainer}>
                <TouchableHighlight accessible={true} accessibilityLabel="Fechar"
                  style={{ ...styles.modalButtons, backgroundColor: "#A1AF66" }}
                  onPress={this._hideModal}
                >
                  <Text style={styles.textStyle}>Fechar</Text>
                </TouchableHighlight>
              </View>  
            </Modal>          
          : <Search onLocationSelected={this.handleLocationSelected} />}

        	<Button  color="#A1AF66" onPress={() => this.getLocationsDatabase()} title="MOSTRAR MARCAÇÕES PRÓXIMAS" accessible={true}  />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    top: 16,
    left: 0,
    bottom: 0,
		right: 0,
  },
  map: {
    ...StyleSheet.absoluteFill,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  text: {
    flex: 1,
    color: '#000',
    fontSize: 50,
  },
  modalContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  modalButtons: {
    padding: 12,
    marginHorizontal: 16,
    width: '35%', 
    height: 35,
  },
  textStyle:{
    paddingHorizontal:35,
    justifyContent: 'center',
    color: '#FFFF',
    lineHeight:15,
  }
});