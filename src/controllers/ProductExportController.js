const ProductExportService = require("../services/ProductExportService");

const ProductExportController = {
  async createNormalExport(req, res) {
    try {
      const user_id = req.user.userId;
      const { notes, type, items } = req.body;

      if (!type) {
        return res.status(400).json({ message: "type is required" });
      }
      if (type === "sales") {
        return res.status(400).json({ message: "Sales export can not be created here" });
      }

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

      const result = await ProductExportService.createNormalProductExport({
        user_id,
        notes,
        type,
        items,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getProductExports(req, res) {
    try {
      const {
        page,
        limit,
        q,
        fromDate,
        toDate,
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

      const result = await ProductExportService.getProductExports({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        fromDate,
        toDate,
        type,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await ProductExportService.getProductExportById(req.params.id);

      if (!result) return res.status(404).json({ message: "Product export not found" });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateNotes(req, res) {
    try {
      const { notes } = req.body;

      const updated = await ProductExportService.updateProductExportNotes(
        req.params.id,
        notes
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
}

module.exports = ProductExportController;
