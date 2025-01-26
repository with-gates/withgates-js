import { registerRootComponent } from 'expo'
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import {useKnob, KnobGuard} from '@withgates/react-native'
import { gates } from './';

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
  const [count, setCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const isEnabled = useKnob('feature_flag_new_dashboard_v4');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await gates.init();
    await gates.signInUser('00000-22222');
    await gates.sync();
    await gates.setUserAttributes({
      custom: {
        email: 'test@test.com',
        name: 'test',
      },
    });

    setIsInitialized(true);
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text>feature-flag-1: {isEnabled ? "enabled" : "disabled"}</Text>
      <KnobGuard value="admin_filters">      
          <Text style={styles.buttonText}>Hello World!</Text>
      </KnobGuard>
    </View>
  )
}
