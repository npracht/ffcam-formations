import { describe, it, expect, vi } from 'vitest';
import { EmailTemplateRenderer } from './emailTemplate.service';
import { makeFormation } from '@/test/factories';

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

const renderDates = (dates: string[]): string => {
  const html = new EmailTemplateRenderer().render([makeFormation({ dates })]);
  const match = html.match(/<strong>Dates:<\/strong>\s*([^<]*?)\s*<\/li>/);
  return match ? match[1] : '';
};

describe('EmailTemplateRenderer — dates', () => {
  it('affiche une date unique en toutes lettres', () => {
    expect(renderDates(['2025-03-14T00:00:00.000Z'])).toBe('14 mars 2025');
  });

  it('regroupe une plage sur un même mois', () => {
    expect(renderDates(['2025-03-16T00:00:00.000Z', '2025-03-14T00:00:00.000Z']))
      .toBe('du 14 au 16 mars 2025');
  });

  it('gère une plage à cheval sur deux mois', () => {
    expect(renderDates(['2025-02-28T00:00:00.000Z', '2025-03-02T00:00:00.000Z']))
      .toBe('du 28 février au 2 mars 2025');
  });

  it('gère une plage à cheval sur deux années', () => {
    expect(renderDates(['2025-12-30T00:00:00.000Z', '2026-01-02T00:00:00.000Z']))
      .toBe('du 30 décembre 2025 au 2 janvier 2026');
  });

  it('accepte les dates sans heure', () => {
    expect(renderDates(['2024-05-01', '2024-05-02'])).toBe('du 1er au 2 mai 2024');
  });

  it('écrit « 1er » pour le premier du mois', () => {
    expect(renderDates(['2025-03-01T00:00:00.000Z'])).toBe('1er mars 2025');
    expect(renderDates(['2025-02-27T00:00:00.000Z', '2025-03-01T00:00:00.000Z']))
      .toBe('du 27 février au 1er mars 2025');
  });

  it("n'affiche jamais le format ISO brut", () => {
    const html = new EmailTemplateRenderer().render([
      makeFormation({ dates: ['2025-03-14T00:00:00.000Z', '2025-03-16T00:00:00.000Z'] }),
    ]);
    expect(html).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('ignore les dates vides ou invalides', () => {
    expect(renderDates(['', 'pas-une-date', '2025-03-14T00:00:00.000Z'])).toBe('14 mars 2025');
    expect(renderDates([])).toBe('Dates non spécifiées');
    expect(renderDates(['pas-une-date'])).toBe('Dates non spécifiées');
  });
});
