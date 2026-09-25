/**
 * Comités régionaux organisateurs, déduits de la référence FFCAM du stage.
 *
 * La référence suit le format `AAAA FF SS NNN RR X OO`, par ex. `2027FCCOPPE84712` :
 * - AAAA : année
 * - FF / SS : famille et sous-code de discipline
 * - NNN : niveau (INI, INT, RIN, PPE…)
 * - RR : code INSEE de la région de la structure organisatrice (84 = Auvergne-Rhône-Alpes)
 * - X OO : numéro d'ordre
 *
 * ⚠️ La région est celle du comité qui ORGANISE la formation, pas celle du lieu
 * où elle se déroule (un comité peut organiser un stage hors de sa région, ou en visio).
 */

export const REGIONS: Readonly<Record<string, string>> = {
  '01': 'Guadeloupe',
  '02': 'Martinique',
  '03': 'Guyane',
  '04': 'La Réunion',
  '06': 'Mayotte',
  '11': 'Île-de-France',
  '24': 'Centre-Val de Loire',
  '27': 'Bourgogne-Franche-Comté',
  '28': 'Normandie',
  '32': 'Hauts-de-France',
  '44': 'Grand Est',
  '52': 'Pays de la Loire',
  '53': 'Bretagne',
  '75': 'Nouvelle-Aquitaine',
  '76': 'Occitanie',
  '84': 'Auvergne-Rhône-Alpes',
  '93': "Provence-Alpes-Côte d'Azur",
  '94': 'Corse',
};

export type RegionOption = { value: string; label: string };

/** Explication affichée à côté des filtres par comité (recherche et notifications). */
export const COMITE_TOOLTIP =
  "Il s'agit du comité régional qui organise la formation, et non du lieu où elle se déroule : un comité peut organiser un stage dans une autre région ou en visio.";

const REFERENCE_PATTERN = /^\d{4}[A-Z]{7}(\d{2})\d{3}$/;

/** Code région (INSEE, 2 chiffres) du comité organisateur, ou null si la référence est inexploitable. */
export function getRegionCodeFromReference(reference: string | null | undefined): string | null {
  const match = reference?.trim().toUpperCase().match(REFERENCE_PATTERN);
  return match ? match[1] : null;
}

export function isKnownRegionCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(REGIONS, code);
}

export function getRegionLabel(code: string): string {
  return isKnownRegionCode(code) ? REGIONS[code] : `Région ${code}`;
}

const byLabel = (a: RegionOption, b: RegionOption) => a.label.localeCompare(b.label, 'fr');

/** Toutes les régions connues, triées par libellé. */
export function getAllRegionOptions(): RegionOption[] {
  return Object.keys(REGIONS)
    .map(code => ({ value: code, label: REGIONS[code] }))
    .sort(byLabel);
}

/** Régions effectivement présentes dans une liste de formations, triées par libellé. */
export function getRegionOptionsFromFormations(formations: Array<{ reference: string }>): RegionOption[] {
  const codes = new Set<string>();
  for (const { reference } of formations) {
    const code = getRegionCodeFromReference(reference);
    if (code) codes.add(code);
  }
  return [...codes].map(code => ({ value: code, label: getRegionLabel(code) })).sort(byLabel);
}

/**
 * Pour chaque organisateur, les régions (codes) de ses formations.
 * Sert à ne proposer que les organisateurs des comités régionaux sélectionnés.
 */
export function getOrganisateurRegions(
  formations: Array<{ reference: string; organisateur: string }>
): Record<string, string[]> {
  const map: Record<string, Set<string>> = {};
  for (const { reference, organisateur } of formations) {
    const code = getRegionCodeFromReference(reference);
    if (!organisateur || !code) continue;
    (map[organisateur] ??= new Set()).add(code);
  }
  return Object.fromEntries(Object.entries(map).map(([org, codes]) => [org, [...codes]]));
}

/** Organisateurs rattachés à au moins une des régions (toutes si aucune région). */
export function filterOrganisateursByRegions(
  organisateurs: string[],
  organisateurRegions: Record<string, string[]>,
  regions: readonly string[]
): string[] {
  if (regions.length === 0) return organisateurs;
  return organisateurs.filter(org => (organisateurRegions[org] ?? []).some(code => regions.includes(code)));
}

/**
 * Garde les formations organisées par l'une des régions demandées.
 * Une liste vide (ou absente) signifie « toutes les régions ».
 */
export function filterFormationsByRegions<T extends { reference: string }>(
  formations: T[],
  regions: readonly string[] | null | undefined
): T[] {
  if (!regions || regions.length === 0) return formations;
  const wanted = new Set(regions);
  return formations.filter(f => {
    const code = getRegionCodeFromReference(f.reference);
    return code !== null && wanted.has(code);
  });
}
