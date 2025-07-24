import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock UI components that use path aliases
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className = '', ...props }: any) => 
    React.createElement('div', { className: `card ${className}`, ...props }, children),
  CardContent: ({ children, className = '', ...props }: any) => 
    React.createElement('div', { className: `card-content ${className}`, ...props }, children),
  CardHeader: ({ children, className = '', ...props }: any) => 
    React.createElement('div', { className: `card-header ${className}`, ...props }, children),
  CardTitle: ({ children, className = '', ...props }: any) => 
    React.createElement('h3', { className: `card-title ${className}`, ...props }, children),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className = '', ...props }: any) => 
    React.createElement('button', { className: `button ${className}`, ...props }, children),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ className = '', ...props }: any) => 
    React.createElement('input', { className: `input ${className}`, ...props }),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'select', ...props }, children),
  SelectContent: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'select-content', ...props }, children),
  SelectItem: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'select-item', ...props }, children),
  SelectTrigger: ({ children, className = '', ...props }: any) => 
    React.createElement('button', { className: `select-trigger ${className}`, ...props }, children),
  SelectValue: ({ placeholder, ...props }: any) => 
    React.createElement('span', { className: 'select-value', ...props }, placeholder),
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => 
    React.createElement('form', props, children),
  FormControl: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'form-control', ...props }, children),
  FormField: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'form-field', ...props }, children),
  FormItem: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'form-item', ...props }, children),
  FormLabel: ({ children, ...props }: any) => 
    React.createElement('label', { className: 'form-label', ...props }, children),
  FormMessage: ({ children, ...props }: any) => 
    React.createElement('div', { className: 'form-message', ...props }, children),
}));

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
}); 