import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Home from './pages/Home';
import Points from './pages/Points';
import Detail from './pages/Detail';

const App_stack = createStackNavigator();

const Routes = () => {
  return (
    <NavigationContainer>
      <App_stack.Navigator
        headerMode="none"
        screenOptions={{ 
          cardStyle: {
            backgroundColor: '#F0F0F5'
          }
        }}
      >
        <App_stack.Screen name="Home" component={Home} />
        <App_stack.Screen name="Points" component={Points} />
        <App_stack.Screen name="Detail" component={Detail} />
      </App_stack.Navigator>
    </NavigationContainer>
  )
};

export default Routes;