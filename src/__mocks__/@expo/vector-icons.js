import React from 'react';
import { Text } from 'react-native';

const MockIcon = ({ name, color, size }) => (
  <Text testID={`icon-${name}`} style={{ color, fontSize: size }}>
    {name}
  </Text>
);

module.exports = {
  FontAwesome5: MockIcon,
  MaterialCommunityIcons: MockIcon,
};
