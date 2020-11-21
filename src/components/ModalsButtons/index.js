import React, { Component, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import firebase from 'firebase';
import { Audio } from 'expo-av';
import { BorderlessButton } from 'react-native-gesture-handler'
import { FontAwesome5} from '@expo/vector-icons';

import * as geofirestore from 'geofirestore';

var locationsP = [];

const playback = async(url) => {
  const playbackObject = await fetch(Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true }
  ));
  return playbackObject
};

function playAudio(item) {
  firebase.storage().ref(`audios/${item.pointLocation}`).getDownloadURL().then(url => {
    console.log("PlayAudio "+url)
    
    return (async () => {
      const value = await playback(url)
  })()
  });
}
export default class ModalsButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: null,
      visibleModal: null,
    };
  }
  
  componentDidMount =  () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        let long = parseFloat(position.coords.longitude);
        let lat = parseFloat(position.coords.latitude);
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
    )
  };
 
  async getPointsDatabase(){
    const { region } = this.state;
    
    if (region) {
      let lat = region.latitude
      let lng = region.longitude
      var dados = null;

      const firestore = firebase.firestore();        
      const GeoFirestore = geofirestore.initializeApp(firestore);        
      const geocollection = GeoFirestore.collection('locations');
      const query = geocollection.near({ 
        center: new firebase.firestore.GeoPoint(
          lat, 
          lng
        ), radius: 10
      });
        
      try {
         const locationsX = await query.get();
         locationsX.forEach(doc => 
          {  
            let docRef = firebase.firestore().collection("locations").doc(doc.id);
            docRef.get().then(function(doc) {          
              if (doc.exists) {
                const pointLocation = doc.data().coordinates.latitude+'|'+doc.data().coordinates.longitude
                  dados = {
                    id: doc.id,
                    pointLocation: pointLocation,
                    title: doc.data().name
                  }
                  console.log(dados)
                  if(locationsP.find(item => item.id === dados.id)===undefined){
                    locationsP.push(dados);
                  }
              } else {
                console.log("Documento não encontrado !");
              }
            }).catch(function(error) {
                console.log("Erro encontrado", error);
            });
          })
      } catch (err) {
       console.log(err);
      }
    }
  }

  resetAudiosFirebase() {
    locations = [];
    this.getPointsDatabase;
    
  }

  _renderButton = (text, onPress) => (
    <TouchableOpacity onPress={onPress} accessible={true} accessibilityLabel={text}>
      <View style={styles.button}>
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  _renderModalPoints = () => {
    return (
    <View style={styles.modalContent} accessible={true}>
      <View style={styles.modalHeader}>
        <Text>PONTOS DE ATENÇÃO</Text>
      </View>
      <Text>__________________________</Text>
      <FlatList
        data={locationsP}
        keyExtractor={item => item.id}
        renderItem={({item}) => 
        <View style={styles.modalHeader}> 
        <Text>{item.title}&nbsp;&nbsp;</Text>
        <TouchableOpacity onPress={() => playAudio(item)} accessible={true} accessibilityLabel="Clique para ouvir">
          <BorderlessButton>
            <FontAwesome5 name="play-circle" size={40} color="black" ></FontAwesome5>
          </BorderlessButton>
        </TouchableOpacity>
          
        </View>
        }
      />
      {this._renderButton('Fechar', () => this.setState({ visibleModal: null }))}
    </View>
  )};

  _renderModalHelp = () => {
    return (
    <View style={styles.modalContent} accessible={true}>
      <View style={styles.modalHeader}>
        <Text>DICAS</Text>
      </View>
      <Text>__________________________</Text>
      <Text></Text>
      <Text>
        <Text style={styles.textBold}>Como fazer marcações?</Text>{"\n"}
        <Text>Procure no mapa onde se deseja fazer a marcação, clique no lugar e grave seu áudio.</Text> {"\n"}{"\n"}

        <Text style={styles.textBold}>Como gravar o áudio?</Text> {"\n"}
        <Text>
          Clique no botão de "Rec" e aguarde a contagem aparecer. Após terminar, é só clicar novamente no botão para encerrar a gravação.
          Sugere-se áudios não muitos grandes.
        </Text> {"\n"}{"\n"}
        
        <Text style={styles.textBold}>O que o áudio deve conter?</Text> {"\n"}
        <Text>
          Informações fáceis e suscintas sobre o local em questão.{"\n"}
          Exemplos: {"\n"}
          Rua em manutenção, acesso pela calçada da direita.
          Orelhão próximo ao meio fio, seguir pela esquerda.
        </Text>
      </Text>

      {this._renderButton('Fechar', () => this.setState({ visibleModal: null }))}
    </View>
  )};

  render() {
    const { btnPoints, btnHelp } = this.props;
    if(btnPoints){
      this.getPointsDatabase();
    }
    return (
      <View style={styles.container}>
        {btnPoints && this._renderButton('Pontos de Atenção', () => this.setState({ visibleModal: 1 }))}
        {btnHelp && this._renderButton('Dúvidas?', () => this.setState({ visibleModal: 2 }))}
        <Modal isVisible={this.state.visibleModal === 1}>
          {this._renderModalPoints()}
        </Modal>
        <Modal isVisible={this.state.visibleModal === 2}>
        {this._renderModalHelp()}
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF',
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#A1AF66',
    padding: 12,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',

  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
    
  },
  buttonText: {
    color: '#FFFF',
  },
  item: {
    color: '#0000',
    padding: 5,
    fontSize: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    width: 60,
    height: 60,
  },
  modalHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
    flexDirection: 'row'
  },
  textBold:{
    fontWeight: 'bold',
    fontSize: 15,
  }
});