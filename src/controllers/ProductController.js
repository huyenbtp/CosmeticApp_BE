const ProductService = require("../services/ProductService");

class ProductController {
  async create(req, res) {
    try {
      const data = {
        ...req.body,
        image: req.file?.path || "",
      };

      const product = await ProductService.createProduct(data);

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProductsInfinite(req, res) {
    try {
      const { page, limit, q } = req.query;

      const result = await ProductService.getProductsInfinite({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        q,
      });

      res.json(result);
    } catch (error) {
      console.error("Get products infinite failed:", error);
      return res.status(500).json({
        message: "Failed to fetch products",
      });
    }
  }

  async getProductsPaginated(req, res) {
    try {
      const {
        page,
        limit,
        q,
        category_slug,
        brand_id,
        minStock,
        maxStock,
        minPrice,
        maxPrice,
        status,
      } = req.query;

      const result = await ProductService.getProductsPaginated({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        category_slug,
        brand_id,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        maxStock: maxStock !== undefined ? Number(maxStock) : undefined,
        minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
        status,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const result = await ProductService.getProductStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);

      if (!product) return res.status(404).json({ message: "Product not found" });

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getImportProductBySKU(req, res) {
    try {
      const product = await ProductService.getImportProductBySKU(req.params.sku);

      res.json(product || null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const data = {
        ...req.body,
        ...(req.file && { image: req.file.path }),
      };

      const updated = await ProductService.updateProduct(req.params.id, data);

      if (!updated) return res.status(404).json({ message: "Product not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      if (!["published", "unpublished"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const updated = await ProductService.updateProductStatus(
        req.params.id,
        status
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await ProductService.deleteProduct(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Product not found" });

      res.json({ message: "Product deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
