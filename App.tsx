/**
 * Root app component — sets up theme provider, navigation container,
 * and the native-stack navigator with TaskList and AddTask screens.
 * Manages the splash screen lifecycle: keeps it visible until the app
 * is ready (theme and tasks loaded).
 */
import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { TaskListScreen } from './screens/TaskListScreen';
import { AddTaskScreen } from './screens/AddTaskScreen';

export type RootStackParamList = {
  TaskList: undefined;
  AddTask: { taskId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Keep the splash screen visible while we load app data
SplashScreen.preventAutoHideAsync();

const AppNavigator: React.FC = () => {
  const { mode, isLoading } = useThemeContext();

  // Hide splash screen once theme is loaded
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="TaskList"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="TaskList" component={TaskListScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
