const DiscountCodeService = require("../services/DiscountCodeService");

class DiscountCodeController {
  async create(req, res) {
    try {
      const discountCode = await DiscountCodeService.createDiscountCode(req.body);
      res.status(201).json(discountCode);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const discountCodes = await DiscountCodeService.getAllDiscountCodes();
      res.json(discountCodes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const discountCode = await DiscountCodeService.getDiscountCodeById(req.params.id);

      if (!discountCode) return res.status(404).json({ message: "DiscountCode not found" });

      res.json(discountCode);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await DiscountCodeService.updateDiscountCode(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "DiscountCode not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await DiscountCodeService.deleteDiscountCode(req.params.id);

      if (!deleted) return res.status(404).json({ message: "DiscountCode not found" });

      res.json({ message: "DiscountCode deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DiscountCodeController();