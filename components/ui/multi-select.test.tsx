import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { MultiSelect } from './multi-select';

const options = [
  { value: '84', label: 'Auvergne-Rhône-Alpes' },
  { value: '53', label: 'Bretagne' },
  { value: '93', label: "Provence-Alpes-Côte d'Azur" },
];

function Harness({ onChange = vi.fn() }: { onChange?: (v: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <MultiSelect
        id="comites"
        label="Comité régional organisateur"
        placeholder="Comité régional organisateur"
        options={options}
        value={value}
        onChange={(v) => { setValue(v); onChange(v); }}
      />
      <button type="button">ailleurs</button>
    </>
  );
}

describe('MultiSelect', () => {
  it('affiche le placeholder puis ouvre la liste au clic', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('permet plusieurs choix et résume la sélection', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comité régional organisateur' }));
    fireEvent.click(screen.getByLabelText('Auvergne-Rhône-Alpes'));
    fireEvent.click(screen.getByLabelText('Bretagne'));

    expect(onChange).toHaveBeenLastCalledWith(['84', '53']);
    expect(screen.getByText('Auvergne-Rhône-Alpes +1')).toBeInTheDocument();
  });

  it('désélectionne tout', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Comité régional organisateur' }));
    fireEvent.click(screen.getByLabelText('Bretagne'));
    fireEvent.click(screen.getByRole('button', { name: 'Tout désélectionner' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByLabelText('Bretagne')).not.toBeChecked();
  });

  it('se ferme avec Échap et au clic extérieur', () => {
    render(<Harness />);
    const button = screen.getByRole('button', { name: 'Comité régional organisateur' });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    fireEvent.mouseDown(screen.getByRole('button', { name: 'ailleurs' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
