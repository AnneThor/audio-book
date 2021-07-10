import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av'
import { Background, Button, Card, Divider, Header, Icon, Image, Logo, Provider, Title } from 'react-native-paper'
import * as FileSystem from 'expo-file-system';
import { audioBookPlaylist } from './assets/audio.js'


const theme = {
  dark: true,
  roundness: 10,
  colors: {
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: "#353535",
    error: '#B00020',
    text: "ivory",
    onSurface: '#000000',
    disabled: "color(black).alpha(0.26).rgb().string()",
    placeholder: "color(black).alpha(0.54).rgb().string()",
    backdrop: "color(black).alpha(0.5).rgb().string()",
    notification: "pinkA400",
  },
  fonts: "configureFonts()",
  animation: {
    scale: 1.0,
  },
}


export default class App extends React.Component {

  state = {
    isPlaying: false,
    playbackInstance: null,
    currentIndex: 0,
    volume: 1.0,
    isBuffering: false
  }

  async componentDidMount() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false, // boolean allowing ios to record
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX, // how it behaves with other apps
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS, // how it behaves with other apps
        shouldDuckAndroid: true, // allows to mute down other apps in android
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: true
      })
      this.loadAudio()
    } catch (e) {
      console.log(e)
    }
  }

  async loadAudio() {
    const {currentIndex, isPlaying, volume} = this.state
    try {
      // this allows you to create an instance that will take the source of the
      // audio file from a local asset file or a remote API URL like the
      // current scenario
      const playbackInstance = new Audio.Sound()
      // from state currentIndex prop Audio instance will find the index of
      // the audio array to play
      const source = { uri: audioBookPlaylist[currentIndex].uri }
      const status = { shouldPlay: isPlaying, volume }
      // set playback... and handler updates the UI if the media
      // is buffered or being played
      playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
      // this takes source of audio file, status of object (uses the shouldPlay
      // and volume props) and the last boolean indicates whether the audio
      // player app shoudl download the audio file before playing
      await playbackInstance.loadAsync(source, status, false)
      this.setState({playbackInstance})
      } catch (e) {
        console.log(e)
      }
  }

  onPlaybackStatusUpdate = status => {
    this.setState({
      isBuffering: status.isBuffering
    })
  }

  // checks value of isPlaying in state and decides whether to play an audio file
  // from the resource it currently loaded or not; decision made using conditional
  // playback instance is using the same value from prev section
  handlePlayPause = async () => {
    const { isPlaying, playbackInstance } = this.state
    isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()
    this.setState({
      isPlaying: !isPlaying
    })
  }

  // used to skip back
  // first it clears the current track with unloadAsync using prop value of
  // currentIndex from state
  handlePreviousTrack = async () => {
    let { playbackInstance, currentIndex } = this.state
    if (playbackInstance) {
      await playbackInstance.unloadAsync()
      currentIndex < audioBookPlaylist.length - 1 ? (currentIndex -= 1) : (currentIndex = 0)
      if (currentIndex === -1) {
        currentIndex = audioBookPlaylist.length - 1
      }
      this.setState({
        currentIndex
      })
      this.loadAudio()
    }
  }

  handleNextTrack = async () => {
    let { playbackInstance, currentIndex } = this.state
    if (playbackInstance) {
      await playbackInstance.unloadAsync()
      currentIndex < audioBookPlaylist.length - 1 ? (currentIndex += 1) : (currentIndex = 0)
      if (currentIndex > audioBookPlaylist.length - 1) {
        currentIndex = 0
      }
      this.setState({
        currentIndex
      })
      this.loadAudio()
    }
  }

  renderFileInfo() {
    const { playbackInstance, currentIndex } = this.state
    return playbackInstance ? (
      <View>
        <Text style={{ alignSelf: "center", fontWeight: "bold", color: "ivory", fontSize: 20 }}>
          {audioBookPlaylist[currentIndex].title} | {audioBookPlaylist[currentIndex].author}
        </Text>
        <Text style={{ alignSelf: "center" }}>
          {audioBookPlaylist[currentIndex].source}
        </Text>
      </View>
    ) : null
  }

  render() {
    return (
      <Provider theme={theme}>
        <Card style={{ flex: 1, flexDirection: 'row', alignItems: 'center', alignContent: 'center', alignSelf: 'center' }}>
          <Title style={styles.title}>Hamlet</Title>
          <Card.Cover source={{ uri: "http://www.archive.org/download/LibrivoxCdCoverArt8/hamlet_1104.jpg" }} />
          <Divider />
          {this.renderFileInfo()}
          <Divider />
          <Button mode="contained"
                  icon={this.state.isPlaying ? "pause" : "play"}
                  style={styles.button}
                  onPress={this.handlePlayPause}>
                    {this.state.isPlaying ? "Pause" : "Play" }
          </Button>
          <Divider />
          <View style={{flexDirection: "row"}}>
          <Button mode="contained"
                  icon="chevron-left-circle-outline"
                  style={styles.backButton}
                  onPress={this.handlePreviousTrack}>BACK</Button>
          <Button mode="contained"
                  icon="chevron-right-circle-outline"
                  style={styles.forwardButton}
                  onPress={this.handleNextTrack}>FORWARD</Button >
          </View>

        </Card>
      </Provider>
    )
  }

}

const styles = {
  main: {
    textAlign: 'center'
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 30
  },
  backButton: {
    width: '46%',
    margin: '2%'

  },
  forwardButton: {
    width: '46%',
    margin: '2%'
  },
  button: {
    margin: '2%'
  }
}
