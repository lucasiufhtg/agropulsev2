export type DiseaseAdvice = {
  cause: string[];
  cure: string[];
  prevention: string[];
};

export const diseaseAdvice: Record<string, DiseaseAdvice> = {
  "Corn Cercospora": {
    cause: [
      "Fungus Cercospora zeae-maydis",
      "Warm, humid weather (25–30°C)",
      "Crop residue left on field",
    ],
    cure: [
      "Spray fungicide (Azoxystrobin or Mancozeb)",
      "Remove and burn infected leaves",
      "Repeat spray every 10–14 days",
    ],
    prevention: [
      "Rotate corn with non-host crops",
      "Plant resistant hybrid varieties",
      "Plough crop residue after harvest",
      "Avoid dense planting for airflow",
    ],
  },
  "Chili Healthy": {
    cause: ["No disease detected", "Plant looks healthy"],
    cure: ["No treatment needed"],
    prevention: [
      "Continue regular watering",
      "Apply balanced fertilizer monthly",
      "Inspect leaves weekly for early signs",
    ],
  },
  "Chili bacterial spot": {
    cause: [
      "Bacteria Xanthomonas campestris",
      "Spread by rain splash and tools",
      "Warm wet weather favours disease",
    ],
    cure: [
      "Spray copper-based bactericide",
      "Remove infected leaves and burn",
      "Avoid overhead watering",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Rotate crops every 2–3 years",
      "Disinfect tools between plants",
      "Mulch to prevent soil splash",
    ],
  },
  "Chili leaf curl": {
    cause: [
      "Virus spread by whiteflies",
      "High whitefly population",
      "Infected nearby plants",
    ],
    cure: [
      "Remove and destroy infected plants",
      "Spray neem oil or imidacloprid for whiteflies",
      "No direct cure for the virus",
    ],
    prevention: [
      "Use yellow sticky traps for whiteflies",
      "Plant resistant varieties",
      "Cover seedlings with fine net",
      "Keep field free of weeds",
    ],
  },
  "Paddy blast": {
    cause: [
      "Fungus Magnaporthe oryzae",
      "High nitrogen fertilizer use",
      "Cool nights with heavy dew",
    ],
    cure: [
      "Spray Tricyclazole or Carbendazim",
      "Drain field briefly to reduce humidity",
      "Reapply fungicide after 10 days",
    ],
    prevention: [
      "Use resistant rice varieties",
      "Avoid excess nitrogen fertilizer",
      "Keep proper plant spacing",
      "Treat seeds before sowing",
    ],
  },
  "Banana Sigatoka": {
    cause: [
      "Fungus Mycosphaerella species",
      "High humidity and rainfall",
      "Poor air circulation in plantation",
    ],
    cure: [
      "Spray Propiconazole or Mancozeb",
      "Cut and burn infected leaves",
      "Repeat spray every 2–3 weeks",
    ],
    prevention: [
      "Maintain proper plant spacing",
      "Remove old leaves regularly",
      "Improve field drainage",
      "Use disease-free suckers",
    ],
  },
};

export const getAdvice = (label: string): DiseaseAdvice | null => {
  if (!label) return null;
  // Try exact match first, then case-insensitive
  if (diseaseAdvice[label]) return diseaseAdvice[label];
  const key = Object.keys(diseaseAdvice).find(
    (k) => k.toLowerCase() === label.toLowerCase()
  );
  return key ? diseaseAdvice[key] : null;
};
