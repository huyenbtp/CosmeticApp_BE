const ImportItemService = require("../services/ImportItemService");

class ImportItemController {
  async create(req, res) {
    try {
      const importItem = await ImportItemService.createImportItem(req.body);
      res.status(201).json(importItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const importItems = await ImportItemService.getAllImportItems();
      res.json(importItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const importItem = await ImportItemService.getImportItemById(req.params.id);

      if (!importItem) return res.status(404).json({ message: "Import item not found" });

      res.json(importItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await ImportItemService.updateImportItem(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Import item not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await ImportItemService.deleteImportItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Import item not found" });

      res.json({ message: "Import item deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ImportItemController();
