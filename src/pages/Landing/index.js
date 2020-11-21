import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import logo from '../../../assets/logoicon.png';
import { useNavigation } from '@react-navigation/native';

function Landing() {
  playsound = async () => {
    await Audio.Sound.createAsync(
      {
        uri:
          'https://firebasestorage.googleapis.com/v0/b/tcc-giu-marcus.appspot.com/o/audios%2Fdefault%2FPreciso_de_Ajuda.mp3?alt=media&token=33b1dc8e-66f5-452c-a432-007d96b319d3',
      },
      { shouldPlay: true }
    );
  };
  const { navigate } = useNavigation();

  function handleNavigateToGiveCanHelpPage() {
    navigate("CanHelp");
  }
  function handleNavigateToGiveNeedHelpPage() {
    navigate("NeedHelp");
  }
  
    return (
        <View style={styles.container}>
            <Image source={logo} style={styles.banner} />
            <Text style={styles.title}>Seja bem-vindo!</Text>
            <View  style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => { handleNavigateToGiveNeedHelpPage(), playsound()}} style={[styles.button, styles.buttonSecondary]}>
              <Text style={styles.buttonText}>Preciso de Ajuda</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNavigateToGiveCanHelpPage} style={[styles.button, styles.buttonPrimary]}>
              <Text style={styles.buttonText}>Quero Ajudar</Text>
              </TouchableOpacity>
            </View>

        </View>   
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A1AF66',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 100
  },
  
  title: {
    color: '#FFF',
    fontSize: 25,
    lineHeight: 30,
    marginTop: 30,
  },
  
  buttonsContainer: {
    marginTop: 20,
  },

  button: {
    height: '25%',
    width: 300,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 40,
    marginTop: 20,
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#FFF',
  },
  buttonSecondary: {
    backgroundColor: '#FFF',
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  banner: {
    marginTop: 120,
    height: 200,
    width: 260,
  }
});

export default Landing;