export interface BirthChartInput {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  city?: string;
}

export interface ZodiacInfo {
  sign: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  rulingPlanet: string;
  symbol: string;
}

const ZODIAC_SIGNS: ZodiacInfo[] = [
  { sign: "Aries", element: "Fire", modality: "Cardinal", rulingPlanet: "Mars", symbol: "♈" },
  { sign: "Taurus", element: "Earth", modality: "Fixed", rulingPlanet: "Venus", symbol: "♉" },
  { sign: "Gemini", element: "Air", modality: "Mutable", rulingPlanet: "Mercury", symbol: "♊" },
  { sign: "Cancer", element: "Water", modality: "Cardinal", rulingPlanet: "Moon", symbol: "♋" },
  { sign: "Leo", element: "Fire", modality: "Fixed", rulingPlanet: "Sun", symbol: "♌" },
  { sign: "Virgo", element: "Earth", modality: "Mutable", rulingPlanet: "Mercury", symbol: "♍" },
  { sign: "Libra", element: "Air", modality: "Cardinal", rulingPlanet: "Venus", symbol: "♎" },
  { sign: "Scorpio", element: "Water", modality: "Fixed", rulingPlanet: "Pluto / Mars", symbol: "♏" },
  { sign: "Sagittarius", element: "Fire", modality: "Mutable", rulingPlanet: "Jupiter", symbol: "♐" },
  { sign: "Capricorn", element: "Earth", modality: "Cardinal", rulingPlanet: "Saturn", symbol: "♑" },
  { sign: "Aquarius", element: "Air", modality: "Fixed", rulingPlanet: "Uranus / Saturn", symbol: "♒" },
  { sign: "Pisces", element: "Water", modality: "Mutable", rulingPlanet: "Neptune / Jupiter", symbol: "♓" },
];

export function getWesternSunSign(month: number, day: number): ZodiacInfo {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC_SIGNS[2];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC_SIGNS[6];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC_SIGNS[7];
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8];
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10];
  return ZODIAC_SIGNS[11];
}

export function computeAstrologyInsights(query: string): string | null {
  const queryLower = query.toLowerCase();

  // Check if query is asking for zodiac signs, birth chart or horoscope
  const dateMatch = query.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/) || 
                    query.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/i);

  if (dateMatch) {
    let month = 1;
    let day = 1;
    if (dateMatch[1].match(/^\d+$/)) {
      month = parseInt(dateMatch[2], 10);
      day = parseInt(dateMatch[3], 10);
    } else {
      const monthNames = ["january","february","march","april","may","june","july","august","september","october","november","december"];
      month = monthNames.indexOf(dateMatch[1].toLowerCase()) + 1;
      day = parseInt(dateMatch[2], 10);
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const sunSign = getWesternSunSign(month, day);
      return `### 🔮 Astrological Birth Chart Calculation
* **Sun Sign**: **${sunSign.sign} ${sunSign.symbol}** (${sunSign.element} Element, ${sunSign.modality} Modality)
* **Ruling Planet**: ${sunSign.rulingPlanet}
* **Core Temperament**: High drive, dynamic expression in ${sunSign.element.toLowerCase()}-aligned pursuits.
* **Vedic Sidereal Estimate**: Shifted ~23°28' back due to Ayanamsha (Lahiri).

*Astrological Chart Breakdown:*
- **1st House (Ascendant)**: Personality, outward aura, vitality.
- **5th House (Creativity & Dharma)**: Natural intellectual instincts and spontaneous self-expression.
- **10th House (Midheaven / Karma)**: Public career trajectories and long-term reputation.`;
    }
  }

  if (queryLower.includes("compatibility") || queryLower.includes("match")) {
    return `### 🔮 Zodiac Compatibility Analysis
Compatibility in astrology is synthesized across the four classical elements:
* **Fire (Aries, Leo, Sagittarius)** with **Air (Gemini, Libra, Aquarius)**: Sparking, intellectual, high momentum.
* **Earth (Taurus, Virgo, Capricorn)** with **Water (Cancer, Scorpio, Pisces)**: Deeply stabilizing, emotional resonance, long-term endurance.
* **Cross-element dynamic**: Requires balancing Moon signs (emotional core) and Venus/Mars placements for romantic and communication harmony.`;
  }

  return null;
}
