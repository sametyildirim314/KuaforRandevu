import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../../src/screens/auth/LoginScreen';
import authStore from '../../../src/store/authStore';

// Mock zustand store
jest.mock('../../../src/store/authStore', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('LoginScreen Flow', () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    // Return mock login function when authStore is called
    authStore.mockReturnValue(mockLogin);
    jest.clearAllMocks();
  });

  it('shows error messages for empty fields', async () => {
    const { getByText } = render(<LoginScreen navigation={{}} />);
    
    // Press login without entering anything
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(getByText('E-posta gerekli')).toBeTruthy();
      expect(getByText('Şifre gerekli')).toBeTruthy();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error for invalid email', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={{}} />);
    
    fireEvent.changeText(getByPlaceholderText('ornek@email.com'), 'invalidemail');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(getByText('Geçerli bir e-posta girin')).toBeTruthy();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function when valid data is provided', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={{}} />);
    
    fireEvent.changeText(getByPlaceholderText('ornek@email.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    
    fireEvent.press(getByText('Giriş Yap'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
