export const countryNameToCode: Record<string, string> = {
  'France': 'FR',
  'Belgique': 'BE',
  'Suisse': 'CH',
  'Maroc': 'MA',
  'Canada': 'CA',
  'Luxembourg': 'LU',
  'Monaco': 'MC',
  'Sénégal': 'SN',
  'Côte d\'Ivoire': 'CI',
  'Tunisie': 'TN'
};

export function getCountryCode(countryName: string): string {
  return countryNameToCode[countryName] || 'FR'; // Default to France if not found
}
