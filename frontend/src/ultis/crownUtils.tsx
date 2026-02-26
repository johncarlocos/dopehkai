/**
 * Crown display rules: only show when win rate exceeds threshold.
 * - > 70%: 1 crown
 * - > 80%: 2 crowns
 * - > 90%: 3 crowns
 * @param winRate - The win rate percentage (0-100)
 * @returns Number of crowns (0, 1, 2, or 3)
 */
export function getCrownCount(winRate: number): number {
    const rate = Number(winRate);
    if (Number.isNaN(rate) || rate <= 70) return 0;
    if (rate > 90) return 3;
    if (rate > 80) return 2;
    return 1;
}

