import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()), // Returns unsubscribe function
}));

vi.mock('../firebase', () => ({
  auth: {},
}));

// Test component to access the auth context
const TestComponent = () => {
  const { user, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide AuthContext to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should render without crashing
    expect(screen.getByTestId('loading')).toBeDefined();
    expect(screen.getByTestId('user')).toBeDefined();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should render the auth provider wrapper', () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Test content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child')).toBeDefined();
    expect(container).toBeDefined();
  });
}); 