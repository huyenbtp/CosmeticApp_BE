const CategoryService = require("../services/CategoryService");

class CategoryController {
  async create(req, res) {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getChildIds(req, res) {
    try {
      const categories = await CategoryService.getAllChildCategoryIds(req.params.id);
      res.json(categories);
    } catch (error) {
      res.status(404).json({ message: "Category not found" });
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);

      if (!category) return res.status(404).json({ message: "Category not found" });

      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Category not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await CategoryService.deleteCategory(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Category not found" });

      res.json({ message: "Category deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();
