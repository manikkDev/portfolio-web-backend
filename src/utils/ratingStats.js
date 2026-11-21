/**
 * Turns per-star counts ([{ _id: 5, n: 3 }, ...]) into the stats the API returns.
 */
export function summarizeRatings(rows) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;

  for (const { _id: stars, n } of rows) {
    if (!(stars in distribution)) continue;
    distribution[stars] = n;
    total += n;
    sum += stars * n;
  }

  return {
    average: total ? parseFloat((sum / total).toFixed(1)) : 0,
    total,
    distribution,
  };
}
