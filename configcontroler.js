import { Config } from "../models/Config.js";

export async function getPublicConfig(req, res) {
  try {
    const config = await Config.findOne({
      active: true
    }).lean();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "No active configuration found"
      });
    }

    const publicConfig = {
      config_version: config.config_version,

      business: config.business,

      questions: config.questions
        .filter((question) => question.active)
        .sort((a, b) => a.order - b.order)
        .map((question) => ({
          key: question.key,
          label: question.label,
          type: question.type,
          unit: question.unit,
          required: question.required,
          min: question.min,
          max: question.max,
          options: question.options.map((option) => ({
            value: option.value,
            label: option.label
          }))
        }))
    };

    return res.json({
      success: true,
      config: publicConfig
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load configuration"
    });
  }
}

export async function updateConfig(req, res) {
  try {
    const {
      business,
      questions,
      modifiers
    } = req.body;

    const currentConfig = await Config.findOne({
      active: true
    });

    if (!currentConfig) {
      return res.status(404).json({
        success: false,
        message: "Active configuration not found"
      });
    }

    const newVersion =
      currentConfig.config_version + 1;

    currentConfig.business =
      business ?? currentConfig.business;

    currentConfig.questions =
      questions ?? currentConfig.questions;

    currentConfig.modifiers =
      modifiers ?? currentConfig.modifiers;

    currentConfig.config_version = newVersion;

    await currentConfig.save();

    return res.json({
      success: true,
      message: "Configuration updated successfully",
      config_version: newVersion
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update configuration"
    });
  }
}
