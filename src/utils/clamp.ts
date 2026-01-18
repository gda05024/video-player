export interface ClampOptions {
  min: number;
  max: number;
}

export function clamp(value: number, { min, max }: ClampOptions): number {
  return Math.min(Math.max(value, min), max);
}
