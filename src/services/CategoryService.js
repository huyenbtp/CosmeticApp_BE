const Category = require("../models/Category");
const mongoose = require("mongoose");

class CategoryService {
  async createCategory(data) {
    const { slug, parent_id } = data;

    /* ---------- CHECK SLUG UNIQUE ---------- */
    if (slug) {
      const existedSlug = await Category.findOne({ slug });

      if (existedSlug) {
        throw new Error("Category slug already exists");
      }
    }

    /* ---------- CHECK PARENT_ID ---------- */
    if (parent_id) {
      if (!mongoose.Types.ObjectId.isValid(parent_id)) {
        throw new Error("Invalid parent category");
      }

      const parent = await Category.findById(parent_id);
      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    return await Category.create(data);
  }

  async getAllCategories() {
    return await Category.find().sort({ name: 1 });;
  }

  async getAllChildCategoryIds(parentId) {
    const category = await Category.findById(parentId);
    if (!category) {
      throw new Error("Category not found");
    }

    const result = [];
    const stack = [parentId];

    while (stack.length) {
      const currentId = stack.pop();
      result.push(currentId);

      const children = await Category.find(
        { parent_id: currentId },
        { _id: 1 }
      );

      children.forEach((c) => stack.push(c._id));
    }

    return result;
  }

  async getCategoryById(id) {
    return await Category.findById(id);
  }

  async updateCategory(id, updateData) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }

    const { slug, parent_id } = updateData;

    /* ---------- CHECK SLUG UNIQUE ---------- */
    if (slug && slug !== category.slug) {
      const existedSlug = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existedSlug) {
        throw new Error("Category slug already exists");
      }
    }

    /* ---------- CHECK PARENT_ID ---------- */
    if (parent_id !== undefined) {
      // cho phép null (root)
      if (parent_id === null) {
        category.parent_id = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parent_id)) {
          throw new Error("Invalid parent category");
        }

        if (String(parent_id) === String(id)) {
          throw new Error("Category cannot be its own parent");
        }

        const parent = await Category.findById(parent_id);
        if (!parent) {
          throw new Error("Parent category not found");
        }

        // ❌ Không cho parent là con/cháu của chính nó
        const childIds = await this.getAllChildCategoryIds(id);
        if (childIds.some((cid) => String(cid) === String(parent_id))) {
          throw new Error("Parent category cannot be a child of itself");
        }

        category.parent_id = parent_id;
      }
    }

    /* ---------- UPDATE OTHER FIELDS ---------- */
    Object.keys(updateData).forEach((key) => {
      if (key !== "parent_id") {
        category[key] = updateData[key];
      }
    });

    await category.save();
    return category;
  }

  async deleteCategory(id) {
    return await Category.findByIdAndDelete(id);
  }
}

module.exports = new CategoryService();
