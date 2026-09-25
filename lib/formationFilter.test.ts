import { describe, it, expect } from 'vitest';
import { formatFilters } from './formationFilter';
import { defaultFilters } from '@/hooks/userFormationsFilter';
import { makeFormation } from '@/test/factories';

describe('formatFilters — niveau de stage', () => {
  const future = ['2999-06-01T00:00:00.000Z'];
  const formations = [
    makeFormation({ reference: '2027SNSMINI84701', discipline: 'Ski alpinisme', dates: future }), // formation initiateur 1er degré
    makeFormation({ reference: '2027SNSMINT84701', discipline: 'Ski alpinisme', dates: future }), // certification 1er degré
    makeFormation({ reference: '2027SNSMRIN84701', discipline: 'Ski alpinisme', dates: future }), // recyclage
    makeFormation({ reference: '2027ESESINT84701', discipline: 'Escalade', dates: future }),
    makeFormation({ reference: 'REF-SANS-NIVEAU', discipline: 'Ski alpinisme', dates: future }),
  ];
  const refs = (list: typeof formations) => list.map(f => f.reference);

  it('ne filtre pas sans niveau sélectionné', () => {
    expect(formatFilters(formations, defaultFilters)).toHaveLength(5);
  });

  it('accepte plusieurs niveaux', () => {
    expect(refs(formatFilters(formations, { ...defaultFilters, niveaux: ['initiateur-1-formation', 'initiateur-recyclage'] })))
      .toEqual(['2027SNSMINI84701', '2027SNSMRIN84701']);
  });

  it('se combine avec la discipline (cas de l’issue #31)', () => {
    expect(refs(formatFilters(formations, {
      ...defaultFilters,
      discipline: 'Ski alpinisme',
      niveaux: ['initiateur-1-certification'],
    }))).toEqual(['2027SNSMINT84701']);
  });
});
