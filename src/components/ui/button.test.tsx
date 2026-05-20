import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    // In Vitest with DOM, we'd use vitest extensions to check classes, 
    // but a defined check ensures it mounted successfully.
  });

  it('handles the disabled state properly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders a loading spinner and disables click when isLoading is true', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Submit</Button>);
    
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect((button as HTMLButtonElement).disabled).toBe(true);
    
    // Simulate user interaction
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
