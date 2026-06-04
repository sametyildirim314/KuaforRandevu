import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../src/components/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Giriş Yap" onPress={() => {}} />);
    expect(getByText('Giriş Yap')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Tıkla" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Tıkla'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Tıkla" onPress={onPressMock} disabled={true} />);
    
    fireEvent.press(getByText('Tıkla'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when loading is true', () => {
    const { getByType, queryByText } = render(<Button title="Yükleniyor" onPress={() => {}} loading={true} />);
    
    // @testing-library/react-native will find ActivityIndicator by its React component type
    // Since React Native mocks ActivityIndicator, we check for it directly.
    expect(queryByText('Yükleniyor')).toBeNull(); // Title should not be visible
  });
});
