import { Entry, Position, SizeMetric, RadiusMode, Association } from '@/types/selfmap';

const R_MAX = 120.0;

// Category angular sectors (in degrees)
const CATEGORY_SECTORS: Record<string, [number, number]> = {
  'People': [0, 90],
  'Accomplishments': [90, 180],
  'Life Story': [180, 270],
  'Ideas/Likes': [270, 360],
  'Other': [270, 360]
};

// Convert hex color to RGB tuple
export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
};

// Interpolate between two hex colors
export const interpolateHex = (hex1: string, hex2: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Get color based on valence
export const getValenceColor = (valence: number): string => {
  if (valence >= 0.02) {
    return interpolateHex('#a5d6a7', '#00e676', Math.min(1.0, valence));
  }
  if (valence <= -0.02) {
    return interpolateHex('#ef9a9a', '#ff1744', Math.min(1.0, Math.abs(valence)));
  }
  return '#9e9e9e';
};

// Convert hex to rgba
export const hexToRgba = (hex: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
};

// Calculate size based on metric
export const metricToSize = (
  metric: number,
  minSize: number = 9,
  maxSize: number = 42,
  gamma: number = 0.65
): number => {
  const m = Math.max(0, Math.min(1, metric));
  return minSize + (maxSize - minSize) * Math.pow(m, gamma);
};

// Calculate radial position by valence
export const computePositionByValence = (entries: Entry[]): Record<string, Position> => {
  const byCategory: Record<string, Entry[]> = {};
  
  entries.forEach(entry => {
    if (!byCategory[entry.category]) {
      byCategory[entry.category] = [];
    }
    byCategory[entry.category].push(entry);
  });

  const positions: Record<string, Position> = {};

  Object.entries(byCategory).forEach(([category, items]) => {
    const [startAngle, endAngle] = CATEGORY_SECTORS[category] || [270, 360];
    const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label));
    
    sortedItems.forEach((item, index) => {
      const thetaDeg = startAngle + (endAngle - startAngle) * (index + 0.5) / Math.max(items.length, 1);
      const r = ((1.0 - item.valence) / 2.0) * R_MAX;
      const thetaRad = (thetaDeg * Math.PI) / 180;
      
      positions[item.label] = {
        x: r * Math.cos(thetaRad),
        y: r * Math.sin(thetaRad)
      };
    });
  });

  return positions;
};

// Calculate radial position by power
export const computePositionByPower = (entries: Entry[]): Record<string, Position> => {
  const byCategory: Record<string, Entry[]> = {};
  
  entries.forEach(entry => {
    if (!byCategory[entry.category]) {
      byCategory[entry.category] = [];
    }
    byCategory[entry.category].push(entry);
  });

  const positions: Record<string, Position> = {};

  Object.entries(byCategory).forEach(([category, items]) => {
    const [startAngle, endAngle] = CATEGORY_SECTORS[category] || [270, 360];
    const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label));
    
    sortedItems.forEach((item, index) => {
      const thetaDeg = startAngle + (endAngle - startAngle) * (index + 0.5) / Math.max(items.length, 1);
      const r = (1.0 - item.power) * R_MAX;
      const thetaRad = (thetaDeg * Math.PI) / 180;
      
      positions[item.label] = {
        x: r * Math.cos(thetaRad),
        y: r * Math.sin(thetaRad)
      };
    });
  });

  return positions;
};

// Calculate weighted degree for each node
export const calculateWeightedDegree = (
  entries: Entry[],
  associations: Association[]
): Record<string, number> => {
  const degrees: Record<string, number> = {};
  
  entries.forEach(entry => {
    degrees[entry.label] = 0;
  });

  associations.forEach(assoc => {
    const weight = assoc.weight || 1.0;
    if (degrees[assoc.src] !== undefined) degrees[assoc.src] += weight;
    if (degrees[assoc.dst] !== undefined) degrees[assoc.dst] += weight;
  });

  const maxDegree = Math.max(...Object.values(degrees), 1);
  
  Object.keys(degrees).forEach(key => {
    degrees[key] = degrees[key] / maxDegree;
  });

  return degrees;
};

// Get metric value for an entry
export const getMetricValue = (
  entry: Entry,
  metric: SizeMetric,
  weightedDegrees: Record<string, number>
): number => {
  switch (metric) {
    case 'power':
      return entry.power;
    case 'valence_abs':
      return Math.abs(entry.valence);
    case 'power_x_val':
      return entry.power * Math.abs(entry.valence);
    case 'weighted_degree':
      return weightedDegrees[entry.label] || 0;
    default:
      return entry.power;
  }
};

// Get sizes for all entries in a category
export const getSizesForCategory = (
  entries: Entry[],
  metric: SizeMetric,
  weightedDegrees: Record<string, number>,
  scale: number = 1.0
): number[] => {
  return entries.map(entry => {
    const metricValue = getMetricValue(entry, metric, weightedDegrees);
    return metricToSize(metricValue) * scale;
  });
};

// Get colors for category with alpha
export const getColorsForCategory = (
  entries: Entry[],
  alpha: number
): string[] => {
  return entries.map(entry => {
    const hexColor = getValenceColor(entry.valence);
    return hexToRgba(hexColor, alpha);
  });
};

// Generate ring guide coordinates
export const generateRingGuides = (R_MAX: number): Array<{ x: number[]; y: number[] }> => {
  const ringValues = [0.8, 0.4, 0.0, -0.4, -0.8];
  
  return ringValues.map(v => {
    const r = ((1.0 - v) / 2.0) * R_MAX;
    const points = 73;
    const x: number[] = [];
    const y: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i * 5 * Math.PI) / 180;
      x.push(r * Math.cos(angle));
      y.push(r * Math.sin(angle));
    }
    
    return { x, y };
  });
};

export { R_MAX };
