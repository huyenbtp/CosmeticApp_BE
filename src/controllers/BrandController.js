const BrandService = require("../services/BrandService");

class BrandController {
  async create(req, res) {
    try {
      const brand = await BrandService.createBrand(req.body);
      res.status(201).json(brand);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const brands = await BrandService.getAllBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const brand = await BrandService.getBrandById(req.params.id);

      if (!brand) return res.status(404).json({ message: "Brand not found" });

      res.json(brand);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await BrandService.updateBrand(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Brand not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await BrandService.deleteBrand(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Brand not found" });

      res.json({ message: "Brand deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BrandController();
