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

}

module.exports = InventoryBatchController;
