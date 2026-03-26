import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TabNavigatorGroup = ({ children }) => <View testID="tab-nav-group">{children}</View>;

const createBottomTabNavigator = () => {
  return {
    Navigator: ({ children }) => {
      return (
        <View testID="tab-navigator">
          {React.Children.map(children, (child) => {
            // Render the screen content directly for tests
            const { name, tabBarIcon } = child.props.options || {};
            const content = typeof child.props.children === 'function' 
              ? child.props.children() 
              : child.props.component ? <child.props.component /> : null;
              
            return (
              <View key={child.props.name} testID={`tab-screen-${child.props.name}`}>
                <Text>{child.props.name}</Text>
                {tabBarIcon && tabBarIcon({ focused: false })}
                {content}
              </View>
            );
          })}
        </View>
      );
    },
    Screen: ({ children, component: Component }) => <View>{children || (Component && <Component />)}</View>,
    Group: TabNavigatorGroup,
  };
};

module.exports = {
  createBottomTabNavigator,
};
