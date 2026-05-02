const BrandService = require("../services/BrandService");

class BrandController {
  async getBrandsPaginated(req, res) {
    try {
      const {
        page,
        limit,
        q,
        status,
      } = req.query;

      const result = await BrandService.getBrandsPaginated({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        status,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
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

  async create(req, res) {
    try {
      const data = {
        ...req.body,
        logo: req.file?.path || "",
      };

      const brand = await BrandService.createBrand(data);

      res.status(201).json(brand);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const data = {
        ...req.body,
        ...(req.file && { logo: req.file.path }),
      };

      const updated = await BrandService.updateBrand(req.params.id, data);

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
