const ImportDetailService = require("../services/ImportDetailService");

class ImportDetailController {
  async create(req, res) {
    try {
      const importDetail = await ImportDetailService.createImportDetail(req.body);
      res.status(201).json(importDetail);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const importDetails = await ImportDetailService.getAllImportDetails();
      res.json(importDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const importDetail = await ImportDetailService.getImportDetailById(req.params.id);

      if (!importDetail) return res.status(404).json({ message: "ImportDetail not found" });

      res.json(importDetail);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await ImportDetailService.updateImportDetail(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "ImportDetail not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await ImportDetailService.deleteImportDetail(req.params.id);

      if (!deleted) return res.status(404).json({ message: "ImportDetail not found" });

      res.json({ message: "ImportDetail deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ImportDetailController();
