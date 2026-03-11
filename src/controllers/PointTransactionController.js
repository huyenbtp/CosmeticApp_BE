const PointTransactionService = require("../services/PointTransactionService");

class PointTransactionController {
  async create(req, res) {
    try {
      const pointTransaction = await PointTransactionService.createPointTransaction(req.body);
      res.status(201).json(pointTransaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const pointTransactions = await PointTransactionService.getAllPointTransactions();
      res.json(pointTransactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const pointTransaction = await PointTransactionService.getPointTransactionById(req.params.id);

      if (!pointTransaction) return res.status(404).json({ message: "Point transaction not found" });

      res.json(pointTransactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await PointTransactionService.updatePointTransaction(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Point transaction not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await PointTransactionService.deletePointTransaction(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Point transaction not found" });

      res.json({ message: "Point transaction deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PointTransactionController();
