/**
// Implements the scoring model from section 5.2 of the documentation:
//   Visa safety:        45%
//   Price:               30%
//   Duration:             15%
//   Comfort / layovers:   10%
 * Routes with a serious visa conflict (hasVisaIssue) are always pushed
 * to the bottom and flagged "avoid", regardless of price.
 */

const WEIGHTS = {
    visaSafety: 0.45,
    price: 0.30,
    duration: 0.15,
    comfort: 0.10,
  };
  
  function normalize(value, min, max) {
    if (max === min) return 0;
    return (value - min) / (max - min);
  }
  
  /**
   * @param {Array<Object>} offers  raw Duffel/Kiwi offers, each already
   *   annotated with { totalAmount, totalDurationMinutes, layoverCount,
   *   visaScore, hasVisaIssue }
   * @returns {Array<Object>} same offers, sorted best-first, each with
   *   { score, isRecommended, recommendationReason }
   */
  function rankOffers(offers) {
    if (!offers.length) return [];
  
    const prices = offers.map((o) => o.totalAmount);
    const durations = offers.map((o) => o.totalDurationMinutes);
    const layovers = offers.map((o) => o.layoverCount);
    const visaScores = offers.map((o) => o.visaScore ?? 0);
  
    const priceRange = [Math.min(...prices), Math.max(...prices)];
    const durationRange = [Math.min(...durations), Math.max(...durations)];
    const layoverRange = [Math.min(...layovers), Math.max(...layovers)];
    const visaRange = [Math.min(...visaScores), Math.max(...visaScores)];
  
    const scored = offers.map((offer) => {
      // Lower is better for all four factors, so we invert after normalizing.
      const priceCost = normalize(offer.totalAmount, ...priceRange);
      const durationCost = normalize(offer.totalDurationMinutes, ...durationRange);
      const comfortCost = normalize(offer.layoverCount, ...layoverRange);
      const visaCost = normalize(offer.visaScore ?? 0, ...visaRange);
  
      const weightedCost =
        WEIGHTS.visaSafety * visaCost +
        WEIGHTS.price * priceCost +
        WEIGHTS.duration * durationCost +
        WEIGHTS.comfort * comfortCost;
  
      // Convert cost (0 = best) into a 0-100 "goodness" score for display.
      const score = Math.round((1 - weightedCost) * 100);
  
      return { ...offer, score };
    });
  
    // Hard rule: anything with a real visa conflict sinks below everything
    // else, no matter how cheap.
    scored.sort((a, b) => {
      if (a.hasVisaIssue !== b.hasVisaIssue) return a.hasVisaIssue ? 1 : -1;
      return b.score - a.score;
    });
  
    // Mark the single best non-conflicting route as the headline recommendation.
    const topPick = scored.find((o) => !o.hasVisaIssue);
    return scored.map((offer) => ({
      ...offer,
      isRecommended: topPick ? offer === topPick : false,
    }));
  }
  
  module.exports = { rankOffers, WEIGHTS };