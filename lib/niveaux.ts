/**
 * Niveau / type de stage, déduit de la référence FFCAM.
 *
 * La référence suit le format `AAAA FF SS NNN RR X OO`, par ex. `2027FCCOPPE84712` :
 * NNN (ici PPE) est le code du niveau. Correspondances vérifiées sur les titres des
 * 141 formations publiées le 25/09/2026 (ex. INT = « Certification INITIATEUR 1er degré … »).
 *
 * Les codes sont regroupés en niveaux lisibles : PPE et PPV (VTT) sont tous deux
 * « Pratiquant perfectionné », par exemple.
 */

export type NiveauOption = { value: string; label: string };

type Niveau = NiveauOption & { codes: readonly string[] };

/** Dans l'ordre du cursus, pas par ordre alphabétique. */
export const NIVEAUX: readonly Niveau[] = [
  { value: 'pratiquant-initie', label: 'Pratiquant initié', codes: ['PIN'] },
  { value: 'pratiquant-perfectionne', label: 'Pratiquant perfectionné', codes: ['PPE', 'PPV', 'RSS'] },
  { value: 'pratiquant-specialise', label: 'Pratiquant spécialisé', codes: ['PSP'] },
  { value: 'initiateur-1-formation', label: 'Initiateur 1er degré – formation', codes: ['INI'] },
  { value: 'initiateur-1-certification', label: 'Initiateur 1er degré – certification', codes: ['INT'] },
  { value: 'initiateur-2-formation', label: 'Initiateur 2e degré – formation', codes: ['IQI'] },
  { value: 'initiateur-2-certification', label: 'Initiateur 2e degré – certification', codes: ['IQT'] },
  { value: 'initiateur-recyclage', label: 'Initiateur – recyclage', codes: ['RIN'] },
  { value: 'ufc', label: 'Unité de formation commune (UFC)', codes: ['UFC'] },
  { value: 'animateur', label: 'Animateur', codes: ['ASP'] },
  { value: 'qualification', label: 'Qualifications (ouvreur, gestionnaire EPI…)', codes: ['FES', 'EPI'] },
];

const NIVEAU_BY_CODE = new Map(NIVEAUX.flatMap(n => n.codes.map(code => [code, n.value] as const)));
const NIVEAU_VALUES = new Set(NIVEAUX.map(n => n.value));

const REFERENCE_PATTERN = /^\d{4}[A-Z]{4}([A-Z]{3})\d{5}$/;

/** Code niveau à 3 lettres (INI, INT, PPE…) ou null si la référence est inexploitable. */
export function getNiveauCodeFromReference(reference: string | null | undefined): string | null {
  const match = reference?.trim().toUpperCase().match(REFERENCE_PATTERN);
  return match ? match[1] : null;
}

/** Niveau (valeur de NIVEAUX) d'une formation, ou null si inconnu. */
export function getNiveauFromReference(reference: string | null | undefined): string | null {
  const code = getNiveauCodeFromReference(reference);
  return code ? NIVEAU_BY_CODE.get(code) ?? null : null;
}

export function isKnownNiveau(value: string): boolean {
  return NIVEAU_VALUES.has(value);
}

export function getNiveauLabel(value: string): string {
  return NIVEAUX.find(n => n.value === value)?.label ?? value;
}

/** Tous les niveaux, dans l'ordre du cursus. */
export function getAllNiveauOptions(): NiveauOption[] {
  return NIVEAUX.map(({ value, label }) => ({ value, label }));
}

/** Niveaux effectivement présents dans une liste de formations, dans l'ordre du cursus. */
export function getNiveauOptionsFromFormations(formations: Array<{ reference: string }>): NiveauOption[] {
  const present = new Set(formations.map(f => getNiveauFromReference(f.reference)));
  return getAllNiveauOptions().filter(n => present.has(n.value));
}

/**
 * Garde les formations de l'un des niveaux demandés.
 * Une liste vide (ou absente) signifie « tous les niveaux ».
 */
export function filterFormationsByNiveaux<T extends { reference: string }>(
  formations: T[],
  niveaux: readonly string[] | null | undefined
): T[] {
  if (!niveaux || niveaux.length === 0) return formations;
  const wanted = new Set(niveaux);
  return formations.filter(f => {
    const niveau = getNiveauFromReference(f.reference);
    return niveau !== null && wanted.has(niveau);
  });
}
