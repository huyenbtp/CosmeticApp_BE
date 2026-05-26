const InventoryBatchService = require("../services/InventoryBatchService");

const InventoryBatchController = {

  async getInventoryBatches(req, res) {
    try {
      const {
        page,
        limit,
        q,
        expiredStatus,
        stockStatus,
      } = req.query;

      const result = await InventoryBatchService.getInventoryBatches({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        expiredStatus,
        stockStatus,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await InventoryBatchService.getInventoryBatchById(req.params.id);

      if (!result) return res.status(404).json({ message: "Batch not found" });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getBatchByBatchNumber(req, res) {
    try {
      const batch = await InventoryBatchService.getBatchByBatchNumber(req.params.number);

      res.json(batch || null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await InventoryBatchService.registerNewBatch(req.body);

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await InventoryBatchService.update(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Batch not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await InventoryBatchService.delete(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Batch not found" });

      res.json({ message: "Batch deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = InventoryBatchController;
