import React from 'react';
import { Slider, StyleSheet, Text, TouchableOpacity, View, Button, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { MaterialCommunityIcons, FontAwesome5, Octicons, Foundation } from '@expo/vector-icons';

import firebase from 'firebase';
import * as geofirestore from 'geofirestore';

const BACKGROUND_COLOR = '#FFF';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

export default class Record extends React.Component {
    constructor(props) {
        super(props);
        this.recording = null;
        this.sound = null;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.state = {
            haveRecordingPermissions: false,
            isLoading: false,
            isPlaybackAllowed: false,
            muted: false,
            soundPosition: null,
            soundDuration: null,
            recordingDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isRecording: false,
            fontLoaded: false,
            shouldCorrectPitch: true,
            volume: 1.0,
            rate: 1.0,
            latitude: props.location.lat,
            longitude: props.location.lng,
            address: props.location.adressName,
            audioFinal: null,
        };
        this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
        // // UNCOMMENT THIS TO TEST maxFileSize:
        // this.recordingSettings.android['maxFileSize'] = 12000;
    }

    componentDidMount() {
        this._askForPermissions();
    }

    _askForPermissions = async () => {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        this.setState({
        haveRecordingPermissions: response.status === 'granted',
        });
    };

    _updateScreenForSoundStatus = status => {
        if (status.isLoaded) {
        this.setState({
            soundDuration: status.durationMillis,
            soundPosition: status.positionMillis,
            shouldPlay: status.shouldPlay,
            isPlaying: status.isPlaying,
            rate: status.rate,
            muted: status.isMuted,
            volume: status.volume,
            shouldCorrectPitch: status.shouldCorrectPitch,
            isPlaybackAllowed: true,
        });
        } else {
        this.setState({
            soundDuration: null,
            soundPosition: null,
            isPlaybackAllowed: false,
        });
        if (status.error) {
            console.log(`FATAL PLAYER ERROR: ${status.error}`);
        }
        }
    };

    _updateScreenForRecordingStatus = status => {
        if (status.canRecord) {
        this.setState({
            isRecording: status.isRecording,
            recordingDuration: status.durationMillis,
        });
        } else if (status.isDoneRecording) {
        this.setState({
            isRecording: false,
            recordingDuration: status.durationMillis,
        });
        if (!this.state.isLoading) {
            this._stopRecordingAndEnablePlayback();
        }
        }
    };

    async _stopPlaybackAndBeginRecording() {
        this.setState({
        isLoading: true,
        });
        if (this.sound !== null) {
        await this.sound.unloadAsync();
        this.sound.setOnPlaybackStatusUpdate(null);
        this.sound = null;
        }
        await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        });
        if (this.recording !== null) {
        this.recording.setOnRecordingStatusUpdate(null);
        this.recording = null;
        }

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(this.recordingSettings);
        recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

        this.recording = recording;
        await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
        this.setState({
        isLoading: false,
        });
    }
    async _saveAudioFirebase(audioUri,address, latitude, longitude) {
        const firestore = firebase.firestore();        
        const GeoFirestore = geofirestore.initializeApp(firestore);        
        const geocollection = GeoFirestore.collection('locations');
        
        geocollection.add({
        name: address,
        coordinates: new firebase.firestore.GeoPoint(latitude, longitude)
        })

        let response = await fetch(audioUri);
        let data = await response.blob();
        let metadata = {
            type: 'audio/3gp'
        };
        let file = new File([data], "test.3gp", metadata);

        let pointLocation = latitude+'|'+longitude
        firebase.storage().ref('audios/'+pointLocation).put(file).then ( snapshot =>{
        console.log('Sucesso');
        Alert.alert('Áudio salvo com Sucesso!')
        });

    }

    async _stopRecordingAndEnablePlayback() {
        this.setState({
        isLoading: true,
        });
        try {
        await this.recording.stopAndUnloadAsync();
        } catch (error) {
            console.log(error);
        }
        const info = await FileSystem.getInfoAsync(this.recording.getURI());
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
        
        this.setState({ audioFinal: info.uri });
        
        await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        playsInSilentLockedModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        });
        const { sound, status } = await this.recording.createNewLoadedSoundAsync(
        {
            isLooping: true,
            isMuted: this.state.muted,
            volume: this.state.volume,
            rate: this.state.rate,
            shouldCorrectPitch: this.state.shouldCorrectPitch,
        },
        this._updateScreenForSoundStatus
        );
        this.sound = sound;
        this.setState({
        isLoading: false,
        });
    }

    _onRecordPressed = () => {
        if (this.state.isRecording) {
        this._stopRecordingAndEnablePlayback();
        } else {
        this._stopPlaybackAndBeginRecording();
        }
    };

    _onPlayPausePressed = () => {
        if (this.sound != null) {
        if (this.state.isPlaying) {
            this.sound.pauseAsync();
        } else {
            this.sound.playAsync();
        }
        }
    };

    _onStopPressed = () => {
        if (this.sound != null) {
        this.sound.stopAsync();
        }
    };

    _onMutePressed = () => {
        if (this.sound != null) {
        this.sound.setIsMutedAsync(!this.state.muted);
        }
    };

    _onVolumeSliderValueChange = value => {
        if (this.sound != null) {
        this.sound.setVolumeAsync(value);
        }
    };

    _trySetRate = async (rate, shouldCorrectPitch) => {
        if (this.sound != null) {
        try {
            await this.sound.setRateAsync(rate, shouldCorrectPitch);
        } catch (error) {
            // Rate changing could not be performed, possibly because the client's Android API is too old.
        }
        }
    };

    _onRateSliderSlidingComplete = async value => {
        this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
    };

    _onPitchCorrectionPressed = async value => {
        this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
    };

    _onSeekSliderValueChange = value => {
        if (this.sound != null && !this.isSeeking) {
        this.isSeeking = true;
        this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
        this.sound.pauseAsync();
        }
    };

    _onSeekSliderSlidingComplete = async value => {
        if (this.sound != null) {
        this.isSeeking = false;
        const seekPosition = value * this.state.soundDuration;
        if (this.shouldPlayAtEndOfSeek) {
            this.sound.playFromPositionAsync(seekPosition);
        } else {
            this.sound.setPositionAsync(seekPosition);
        }
        }
    };

    _getSeekSliderPosition() {
        if (
        this.sound != null &&
        this.state.soundPosition != null &&
        this.state.soundDuration != null
        ) {
        return this.state.soundPosition / this.state.soundDuration;
        }
        return 0;
    }

    _getMMSSFromMillis(millis) {
        const totalSeconds = millis / 1000;
        const seconds = Math.floor(totalSeconds % 60);
        const minutes = Math.floor(totalSeconds / 60);

        const padWithZero = number => {
        const string = number.toString();
        if (number < 10) {
            return '0' + string;
        }
        return string;
        };
        return padWithZero(minutes) + ':' + padWithZero(seconds);
    }

    _getPlaybackTimestamp() {
        if (
        this.sound != null &&
        this.state.soundPosition != null &&
        this.state.soundDuration != null
        ) {
        return `${this._getMMSSFromMillis(this.state.soundPosition)} / ${this._getMMSSFromMillis(
            this.state.soundDuration
        )}`;
        }
        return '';
    }

    _getRecordingTimestamp() {
        if (this.state.recordingDuration != null) {
        return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
        }
        return `${this._getMMSSFromMillis(0)}`;
    }

  render() {

    if (!this.state.haveRecordingPermissions){
        return (
            <View style={styles.container}>
                <View />
                <Text style={[styles.noPermissionsText]}>
                  You must enable audio recording permissions in order to use this app.
                </Text>
                <View />
            </View>
        )
    }
    const { latitude, longitude, address, audioFinal } = this.state;
    return (

    <View style={styles.container}>
        <Text style={[styles.addressText]}>Local de marcação{"\n"}{address} </Text>
        <View
        style={[styles.halfScreenContainer, {opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,}]}>
        <View style={styles.recordingContainer}>
            <TouchableOpacity onPress={this._onRecordPressed} accessible={true} accessibilityLabel="Gravar">
                <MaterialCommunityIcons name="record-rec" size={70} color="black" 
                onPress={this._onRecordPressed} disabled={this.state.isLoading}  
                />
            </TouchableOpacity>            
            <View style={styles.recordingDataContainer}>
            <Text style={[styles.liveText]}>
                {this.state.isRecording ? 'Gravando...' : ''}
            </Text>
            <View style={styles.recordingDataRowContainer}>             
                <Foundation name="record" size={24} color="red" style={[styles.image, { opacity: this.state.isRecording ? 1.0 : 0.0 }]} />
                <Text style={[styles.recordingTimestamp]}>
                {this._getRecordingTimestamp()}
                </Text>
            </View>
            </View>
        </View>
        </View>
        <View
        style={[
            styles.halfScreenContainer,
            { opacity: !this.state.isPlaybackAllowed || this.state.isLoading ? DISABLED_OPACITY : 1.0 },
        ]}>
        <View style={styles.playbackContainer}>
            <Slider
            style={styles.playbackSlider}
            value={this._getSeekSliderPosition()}
            onValueChange={this._onSeekSliderValueChange}
            onSlidingComplete={this._onSeekSliderSlidingComplete}
            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            <Text style={[styles.playbackTimestamp]}>
            {this._getPlaybackTimestamp()}
            </Text>
        </View>
        <View style={[styles.buttonsContainerBase, styles.buttonsContainerTopRow]}>
            <View />
            <View style={styles.volumeContainer}>
            {this.state.muted   
            ? <Octicons name="mute" size={50} color="black" onPress={this._onMutePressed}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}  />              
            : <Octicons name="unmute" size={50} color="black" onPress={this._onMutePressed}
            disabled={!this.state.isPlaybackAllowed || this.state.isLoading}  />
            }
            <Slider
                style={styles.volumeSlider}
                value={1}
                onValueChange={this._onVolumeSliderValueChange}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
            />
            </View>
            <View style={styles.playStopContainer}>              
            {this.state.isPlaying ?
                <TouchableOpacity onPress={this._onPlayPausePressed} accessible={true} accessibilityLabel="Pausar">
                    <FontAwesome5 name="pause-circle" size={50} color="black" 
                        disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                    />
                </TouchableOpacity>
            : <TouchableOpacity onPress={this._onPlayPausePressed} accessible={true} accessibilityLabel="Iniciar">
                <FontAwesome5 name="play-circle" size={50} color="black" onPress={this._onPlayPausePressed} 
                    disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                /> 
                </TouchableOpacity>
            }
                <TouchableOpacity onPress={this._onStopPressed} accessible={true} accessibilityLabel="Parar">
                    <FontAwesome5 name="stop" size={40} color="black" onPress={this._onStopPressed}
                        disabled={!this.state.isPlaybackAllowed || this.state.isLoading}              
                    />
                </TouchableOpacity>  
            <Button
                title="Salvar"
                color="#A1AF66"
                onPress={() => this._saveAudioFirebase(audioFinal, address, latitude, longitude)}
                disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
                accessible={true}
            />           
            </View>
            <View />
        </View>          
        <View />
        </View>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
  },
  noPermissionsText: {
    textAlign: 'center',
  },
  wrapper: {},
  halfScreenContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  recordingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  recordingDataContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingDataRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playbackContainer: {
    marginLeft: 15,
    marginRight: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
  liveText: {
    color: LIVE_COLOR,
  },
  recordingTimestamp: {
    paddingLeft: 20,
  },
  addressText: {
    paddingLeft: 20,
    fontSize: 15,
    fontWeight: "bold"
  },
  playbackTimestamp: {
    textAlign: 'right',
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  image: {
    backgroundColor: BACKGROUND_COLOR,
  },
  textButton: {
    backgroundColor: BACKGROUND_COLOR,
    padding: 10,
  },
  buttonsContainerBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonsContainerTopRow: {
    alignSelf: 'stretch',
    paddingRight: 20,
  },
  playStopContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeSlider: {
  },
  buttonsContainerBottomRow: {
    alignSelf: 'stretch',
    paddingRight: 20,
    paddingLeft: 20,
  },
  rateSlider: {
  },
});
