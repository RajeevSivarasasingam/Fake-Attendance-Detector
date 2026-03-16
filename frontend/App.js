import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Dashboard from './screens/Dashboard';
import CaptureClassroom from './screens/CaptureClassroom';
import ScanSignSheet from './screens/ScanSignSheet';
import VerificationResult from './screens/VerificationResult';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen 
            name="Dashboard" 
            component={Dashboard} 
            options={{ title: 'Smart Attendance' }}
          />
          <Stack.Screen 
            name="CaptureClassroom" 
            component={CaptureClassroom} 
            options={{ title: 'Capture Headcount' }}
          />
          <Stack.Screen 
            name="ScanSignSheet" 
            component={ScanSignSheet} 
            options={{ title: 'Scan Sign-in Sheet' }}
          />
          <Stack.Screen 
            name="VerificationResult" 
            component={VerificationResult} 
            options={{ title: 'Verification' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
