import React from 'react';
import { View } from 'react-native';

const NavigationContainer = ({ children }) => {
  return <View testID="navigation-container">{children}</View>;
};

module.exports = {
  NavigationContainer,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
};
