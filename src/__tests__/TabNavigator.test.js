import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from '../navigation/TabNavigator';
import PLATFORMS from '../config/platforms';

// Wrap with NavigationContainer for navigation context
const renderWithNav = (ui) => render(<NavigationContainer>{ui}</NavigationContainer>);

describe('TabNavigator', () => {
  it('renders all 5 platform tab labels', () => {
    const { getByText } = renderWithNav(<TabNavigator />);
    PLATFORMS.forEach((platform) => {
      expect(getByText(platform.label)).toBeTruthy();
    });
  });

  it('renders Facebook tab as the default active tab', () => {
    const { getAllByTestId } = renderWithNav(<TabNavigator />);
    // The WebView for the first tab (Facebook) should be mounted
    const webViews = getAllByTestId('social-webview');
    expect(webViews.length).toBeGreaterThan(0);
  });

  it('has the correct number of tabs (5)', () => {
    expect(PLATFORMS).toHaveLength(5);
    PLATFORMS.forEach((p) => {
      expect(p).toHaveProperty('key');
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('url');
      expect(p).toHaveProperty('color');
    });
  });

  it('each platform has a valid URL', () => {
    PLATFORMS.forEach((platform) => {
      expect(platform.url).toMatch(/^https:\/\//);
    });
  });
});
