import { describe, it, expect } from 'vitest';
import {
  getNiveauCodeFromReference,
  getNiveauFromReference,
  getNiveauLabel,
  getAllNiveauOptions,
  getNiveauOptionsFromFormations,
  filterFormationsByNiveaux,
  isKnownNiveau,
} from './niveaux';

describe('getNiveauFromReference', () => {
  it.each([
    ['2027SNSMINT84701', 'INT', 'initiateur-1-certification'], // Certification initiateur 1er degré
    ['2027ESESINI84701', 'INI', 'initiateur-1-formation'],
    ['2026SNSMIQT93701', 'IQT', 'initiateur-2-certification'],
    ['2027SNSMIQI84701', 'IQI', 'initiateur-2-formation'],
    ['2027SNSMRIN84701', 'RIN', 'initiateur-recyclage'],
    ['2027FCCOPPE84712', 'PPE', 'pratiquant-perfectionne'],
    ['2027VMVMPPV84701', 'PPV', 'pratiquant-perfectionne'], // VTT : même niveau
    ['2027FCCOPIN75706', 'PIN', 'pratiquant-initie'],
    ['2027FCFCUFC93701', 'UFC', 'ufc'],
    ['2027FCFCEPI27801', 'EPI', 'qualification'],
  ])('%s → %s → %s', (reference, code, niveau) => {
    expect(getNiveauCodeFromReference(reference)).toBe(code);
    expect(getNiveauFromReference(reference)).toBe(niveau);
  });

  it('renvoie null pour un code inconnu ou une référence inexploitable', () => {
    expect(getNiveauCodeFromReference('2027FCCOXYZ84701')).toBe('XYZ');
    expect(getNiveauFromReference('2027FCCOXYZ84701')).toBeNull();
    expect(getNiveauFromReference('REF-001')).toBeNull();
    expect(getNiveauFromReference(undefined)).toBeNull();
  });
});

describe('options', () => {
  it('liste les niveaux dans l’ordre du cursus', () => {
    const labels = getAllNiveauOptions().map(o => o.label);
    expect(labels.indexOf('Pratiquant initié')).toBeLessThan(labels.indexOf('Initiateur 1er degré – formation'));
    expect(labels.indexOf('Initiateur 1er degré – certification')).toBeLessThan(labels.indexOf('Initiateur 2e degré – formation'));
  });

  it('ne propose que les niveaux présents, sans doublon', () => {
    expect(getNiveauOptionsFromFormations([
      { reference: '2027SNSMINT84701' },
      { reference: '2027FCCOPPE84712' },
      { reference: '2027VMVMPPV84701' },
      { reference: 'REF-001' },
    ]).map(o => o.value)).toEqual(['pratiquant-perfectionne', 'initiateur-1-certification']);
  });

  it('libellés et validation', () => {
    expect(getNiveauLabel('initiateur-recyclage')).toBe('Initiateur – recyclage');
    expect(isKnownNiveau('ufc')).toBe(true);
    expect(isKnownNiveau('INT')).toBe(false);
  });
});

describe('filterFormationsByNiveaux', () => {
  const formations = [
    { reference: '2027SNSMINT84701' },
    { reference: '2027SNSMINI84701' },
    { reference: '2027SNSMRIN84701' },
    { reference: 'REF-001' },
  ];

  it('ne filtre rien sans niveau sélectionné', () => {
    expect(filterFormationsByNiveaux(formations, [])).toBe(formations);
    expect(filterFormationsByNiveaux(formations, undefined)).toBe(formations);
  });

  it('garde uniquement les niveaux choisis (cas de l’issue #31 : la certification seule)', () => {
    expect(filterFormationsByNiveaux(formations, ['initiateur-1-certification']).map(f => f.reference))
      .toEqual(['2027SNSMINT84701']);
  });
});
