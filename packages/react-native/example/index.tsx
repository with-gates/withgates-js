import { registerRootComponent } from 'expo'
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
  },
})

export const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.buttonText}>Hello World!</Text>
    </View>
  )
}

registerRootComponent(App)