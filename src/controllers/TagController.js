const TagService = require("../services/TagService");

class TagController {
  async create(req, res) {
    try {
      const tag = await TagService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const tags = await TagService.getAllTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const tag = await TagService.getTagById(req.params.id);

      if (!tag) return res.status(404).json({ message: "Tag not found" });

      res.json(tag);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await TagService.updateTag(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Tag not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await TagService.deleteTag(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Tag not found" });

      res.json({ message: "Tag deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new TagController();