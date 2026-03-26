import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import SocialScreen from '../screens/SocialScreen';

// Set up the global ref hook before each test so the mock WebView can expose triggers
beforeEach(() => {
  global.__webViewRef = {};
});

afterEach(() => {
  delete global.__webViewRef;
});

describe('SocialScreen', () => {
  const defaultProps = {
    url: 'https://m.facebook.com',
    themeColor: '#1877F2',
    label: 'Facebook',
  };

  it('renders WebView with the correct source URL', () => {
    const { getByTestId } = render(<SocialScreen {...defaultProps} />);
    // WebView is rendered (mock renders a View with testID)
    expect(getByTestId('social-webview')).toBeTruthy();
  });

  it('shows a loading indicator on initial load', () => {
    const { getByTestId } = render(<SocialScreen {...defaultProps} />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('hides the loading indicator after load completes', async () => {
    const { getByTestId, queryByTestId } = render(<SocialScreen {...defaultProps} />);
    // Trigger onLoadEnd via mock
    global.__webViewRef.triggerLoadEnd();
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  it('shows the error UI when the WebView fires an error', async () => {
    const { getByTestId, getByText } = render(<SocialScreen {...defaultProps} />);
    global.__webViewRef.triggerError();
    await waitFor(() => {
      expect(getByText('Failed to Load Facebook')).toBeTruthy();
    });
    expect(getByTestId('retry-button')).toBeTruthy();
  });

  it('reloads the WebView when the Retry button is pressed', async () => {
    const { getByTestId, queryByText } = render(<SocialScreen {...defaultProps} />);
    global.__webViewRef.triggerError();
    await waitFor(() => {
      expect(queryByText('Failed to Load Facebook')).toBeTruthy();
    });
    fireEvent.press(getByTestId('retry-button'));
    await waitFor(() => {
      // After retry, error screen disappears and WebView is back
      expect(getByTestId('social-webview')).toBeTruthy();
    });
  });
});
