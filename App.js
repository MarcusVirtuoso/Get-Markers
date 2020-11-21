import React from 'react';
import { StatusBar } from 'expo-status-bar';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Map from './src/components/Map';
import Landing from './src/pages/Landing';
import AppStack from './src/routes/AppStack';

import { firebaseConfig } from './config'
import firebase from 'firebase';
firebase.initializeApp(firebaseConfig);
console.disableYellowBox = [
  'Setting a timer'
];
console.ignoredYellowBox = true;

export default class App extends React.Component {
  render() {
    return (
      <>
        <AppStack />
         <StatusBar style="light" />  
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});