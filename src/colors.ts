function hexToRgb(value: string): [number, number, number] {
  value = value.replace('#', '');
  const lv = value.length;
  const chunkSize = lv / 3;
  return [
    parseInt(value.slice(0, chunkSize), 16),
    parseInt(value.slice(chunkSize, 2 * chunkSize), 16),
    parseInt(value.slice(2 * chunkSize), 16),
  ];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(r: number, g: number, b: number): number[] {
  // Convert to values between 0 and 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find maximum and minimum of RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  // Initialize hue, saturation, lightness
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  // Calculate saturation
  if (max !== min) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  }

  // Calculate hue
  if (max === r) {
    h = (g - b) / d + (g < b ? 6 : 0);
  } else if (max === g) {
    h = (b - r) / d + 2;
  } else if (max === b) {
    h = (r - g) / d + 4;
  }

  h /= 6;

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function adjustColor(
  color: string,
  lightnessFactor: number,
  saturationFactor: number
): string {
  const [r, g, b] = hexToRgb(color);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newL = Math.max(0, Math.min(1, l * lightnessFactor));
  const newS = Math.max(0, Math.min(1, s * saturationFactor));
  const [newR, newG, newB] = hslToRgb(h, newS, newL);
  return rgbToHex([Math.round(newR), Math.round(newG), Math.round(newB)]);
}

export function generateColorVariants(baseColor: string): {
  [key: string]: string;
} {
  const variants: { [key: string]: string } = {};
  variants['500'] = adjustColor(baseColor, 0.6, 1.2);
  variants['400'] = adjustColor(baseColor, 0.85, 1.1);
  variants['300'] = baseColor;
  variants['200'] = adjustColor(baseColor, 1.5, 0.9);
  variants['100'] = adjustColor(baseColor, 1.75, 0.8);
  return variants;
}

export function getColorBasedOnSaturation(rgb: string): string {
  // Remove '#'
  rgb = rgb.slice(1);

  // Parse the hexadecimal RGB values
  const r = parseInt(rgb.substring(0, 2), 16);
  const g = parseInt(rgb.substring(2, 4), 16);
  const b = parseInt(rgb.substring(4, 6), 16);

  // Convert RGB to HSL
  const hsl = rgbToHsl(r, g, b);

  // Return white if saturation is greater than 0.5, otherwise return black
  return hsl[1] > 0.5 ? '#fff' : '#000';
}

export function generateCSSVariables(
  accentColor: string,
  themeType: string
): Record<string, string> {
  const colorVariants = generateColorVariants(accentColor);

  return Object.keys(colorVariants).reduce(
    (acc: Record<string, string>, key: string) => {
      const cssVariable = `--sendbird-${themeType}-primary-${key}`;
      acc[cssVariable] = colorVariants[parseInt(key)];
      return acc;
    },
    {}
  );
}
