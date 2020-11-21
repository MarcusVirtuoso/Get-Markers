import React from 'react';
import Map from '../../components/Map';
import ModalsButtons from '../../components/ModalsButtons';
import PageHeader from '../../components/PageHeader';
import { StyleSheet, View} from 'react-native';

function NeedHelp() {
  return (
    <View style={styles.container}>
        <View style={styles.top}>
          <PageHeader /> 
        </View>
        <View style={styles.main}>
          <Map />
        </View>   
        <View>
          <ModalsButtons btnPoints = {true} btnHelp = {true} />
        </View>                   
    </View>   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    paddingHorizontal: 0,
  },
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  }
});

export default NeedHelp;