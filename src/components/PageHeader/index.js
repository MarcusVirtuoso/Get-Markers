import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'

import backIcon from '../../../assets/back.png'

function PageHeader() {
    const { navigate } = useNavigation();

    function handleGoBack(){
        navigate('Landing');

    }
    return (<View style={styles.container}>
        <View style={styles.topBar}> 
            <BorderlessButton onPress={handleGoBack}>
                <Image source={backIcon} style={styles.back} resizeMode="contain" />
            </BorderlessButton>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#A1AF66',
        paddingBottom: 50,

    },
    back:{
        marginTop: 40,
        marginBottom:-10,
        marginLeft: 10,
    }
});
export default PageHeader;