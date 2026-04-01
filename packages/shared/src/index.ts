export const GAME_NAME = 'Aetherfall Realms';
export const SKILLS = ['bladecraft', 'marks', 'arcanum', 'mining', 'timbering', 'culinery'] as const;
export const ZONES = ['hearthmere', 'briarthorn', 'grayfen', 'ashen-verge', 'hollowglass-depths'] as const;

export function diminishingReturns(repetitionScore: number): number {
  if (repetitionScore < 20) return 1;
  if (repetitionScore < 50) return 0.7;
  if (repetitionScore < 100) return 0.4;
  return 0.2;
}
