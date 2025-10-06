import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';
import { Plus } from 'lucide-react';

describe('Button', () => {
  it('should render correctly with children', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(
      <Button>
        <Plus className="h-4 w-4" />
        Click me
      </Button>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByText('Click me');
    await button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});