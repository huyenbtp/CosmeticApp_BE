const SkinTypeService = require("../services/SkinTypeService");

class SkinTypeController {
  async create(req, res) {
    try {
      const skinType = await SkinTypeService.createSkinType(req.body);
      res.status(201).json(skinType);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const skinTypes = await SkinTypeService.getAllSkinTypes();
      res.json(skinTypes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const skinType = await SkinTypeService.getSkinTypeById(req.params.id);

      if (!skinType) return res.status(404).json({ message: "SkinType not found" });

      res.json(skinType);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await SkinTypeService.updateSkinType(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "SkinType not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await SkinTypeService.deleteSkinType(req.params.id);

      if (!deleted) return res.status(404).json({ message: "SkinType not found" });

      res.json({ message: "SkinType deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SkinTypeController();