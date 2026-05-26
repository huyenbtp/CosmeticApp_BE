const ProductImportService = require("../services/ProductImportService");

const ProductImportController = {
  async create(req, res) {
    try {
      const user_id = req.user.userId;
      const { notes, status, type, items } = req.body;

      /* ---------- BASIC VALIDATION ---------- */
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "items must be a non-empty array" });
      }

      for (const item of items) {
        if (!item.batch_id) {
          return res.status(400).json({ message: "batch_id is required" });
        }
        if (item.unit_price === undefined || item.unit_price < 0) {
          return res.status(400).json({ message: "unit_price must be >= 0" });
        }
        if (!item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "quantity must be > 0" });
        }
      }

      const result = await ProductImportService.createProductImport({
        user_id,
        notes,
        status,
        type,
        items,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await ProductImportService.updateProductImport(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Import not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async confirmImport(req, res) {
    try {
      const user_id = req.user.userId;
      const import_id = req.params.id;

      const result = await ProductImportService.confirmImport(user_id, import_id);

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async deleteImport(req, res) {
    try {
      const import_id = req.params.id;

      const result = await ProductImportService.deleteImport(import_id);

      if (!result) return res.status(404).json({ message: "Product import not found" });

      res.json({ message: "Product import deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getStats(req, res) {
    try {
      const result = await ProductImportService.getProductImportStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getProductImports(req, res) {
    try {
      const {
        page,
        limit,
        q,
        fromDate,
        toDate,
        minTotal,
        maxTotal,
        status,
        type,
      } = req.query;

      /* ---------- VALIDATE DATE ---------- */
      if (fromDate && isNaN(Date.parse(fromDate))) {
        return res.status(400).json({ message: "Invalid fromDate" });
      }

      if (toDate && isNaN(Date.parse(toDate))) {
        return res.status(400).json({ message: "Invalid toDate" });
      }

      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return res
          .status(400)
          .json({ message: "fromDate must be before toDate" });
      }

      /* ---------- VALIDATE TOTAL ---------- */
      if (minTotal && isNaN(minTotal)) {
        return res.status(400).json({ message: "Invalid minTotal" });
      }

      if (maxTotal && isNaN(maxTotal)) {
        return res.status(400).json({ message: "Invalid maxTotal" });
      }

      if (
        minTotal !== undefined &&
        maxTotal !== undefined &&
        Number(minTotal) > Number(maxTotal)
      ) {
        return res
          .status(400)
          .json({ message: "minTotal must be <= maxTotal" });
      }

      const result = await ProductImportService.getProductImports({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        fromDate,
        toDate,
        minTotal: minTotal !== undefined ? Number(minTotal) : undefined,
        maxTotal: maxTotal !== undefined ? Number(maxTotal) : undefined,
        status,
        type,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await ProductImportService.getProductImportById(req.params.id);

      if (!result) return res.status(404).json({ message: "Product import not found" });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateNotes(req, res) {
    try {
      const { notes } = req.body;

      const updated = await ProductImportService.updateProductImportNotes(
        req.params.id,
        notes
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
}

module.exports = ProductImportController;
