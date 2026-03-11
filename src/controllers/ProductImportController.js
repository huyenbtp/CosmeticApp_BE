const ProductImportService = require("../services/ProductImportService");
const Staff = require("../models/Staff");

class ProductImportController {
  async create(req, res) {
    try {
      const { note, items } = req.body;

      /* ---------- BASIC VALIDATION ---------- */
      const staff = await Staff.findOne({ account_id: req.user.accountId });

      if (!staff) {
        throw new Error("Staff not found");
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "items must be a non-empty array" });
      }

      for (const item of items) {
        if (!item.product_id) {
          return res.status(400).json({ message: "product_id is required" });
        }
        if (item.unit_price === undefined || item.unit_price < 0) {
          return res.status(400).json({ message: "unit_price must be >= 0" });
        }
        if (!item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "quantity must be > 0" });
        }
      }

      const result = await ProductImportService.createProductImport({
        staff_id: staff._id,
        note,
        items,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const result = await ProductImportService.getProductImportStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProductImports(req, res) {
    try {
      const {
        page,
        limit,
        q,
        by,
        fromDate,
        toDate,
        minTotal,
        maxTotal,
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
        by,
        fromDate,
        toDate,
        minTotal: minTotal !== undefined ? Number(minTotal) : undefined,
        maxTotal: maxTotal !== undefined ? Number(maxTotal) : undefined,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const result = await ProductImportService.getProductImportById(req.params.id);

      if (!result) return res.status(404).json({ message: "Product import not found" });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateNote(req, res) {
    try {
      const { note } = req.body;

      const updated = await ProductImportService.updateProductImportNote(
        req.params.id,
        note
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProductImportController();
