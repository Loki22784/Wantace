export function calculateEstimate(config, answers) {
  const questions = config.questions || [];
  const modifiers = config.modifiers || {};

  const roofArea = Number(answers.roof_area);

  if (!Number.isFinite(roofArea)) {
    throw new Error("Invalid roof area");
  }

  const getQuestion = (key) => {
    return questions.find((question) => question.key === key);
  };

  const getSelectedOption = (questionKey) => {
    const question = getQuestion(questionKey);

    if (!question) {
      throw new Error(`Configuration question '${questionKey}' not found`);
    }

    const selectedValue = answers[questionKey];

    if (selectedValue === undefined || selectedValue === null) {
      throw new Error(`Missing answer for '${questionKey}'`);
    }

    const option = question.options.find(
      (item) => item.value === selectedValue
    );

    if (!option) {
      throw new Error(
        `Invalid option '${selectedValue}' for '${questionKey}'`
      );
    }

    return option;
  };

  const materialOption = getSelectedOption("material");
  const pitchOption = getSelectedOption("pitch");
  const layersOption = getSelectedOption("layers");
  const storiesOption = getSelectedOption("stories");

  const ratePerSqft = Number(materialOption.rate_per_sqft || 0);

  const pitchMultiplier = Number(
    pitchOption.multiplier ?? 1
  );

  const tearOffPerSqft = Number(
    layersOption.tear_off_per_sqft || 0
  );

  const storiesMultiplier = Number(
    storiesOption.multiplier ?? 1
  );

  const wasteFactor = Number(
    modifiers.waste_factor ?? 0.10
  );

  const permitFee = Number(
    modifiers.permit_flat_fee ?? 350
  );

  const spreadPct =
    Number(modifiers.range_spread_pct ?? 12) / 100;

  const baseMaterialCost =
    roofArea *
    ratePerSqft *
    (1 + wasteFactor);

  const tearOffCost =
    roofArea *
    tearOffPerSqft;

  const adjustedSubtotal =
    (baseMaterialCost + tearOffCost) *
    pitchMultiplier *
    storiesMultiplier;

  const midPointEstimate =
    adjustedSubtotal + permitFee;

  const estimateLow =
    Math.round(midPointEstimate * (1 - spreadPct));

  const estimateHigh =
    Math.round(midPointEstimate * (1 + spreadPct));

  return {
    estimate_low: estimateLow,
    estimate_high: estimateHigh,
    estimate_mid: Math.round(midPointEstimate)
  };
}
