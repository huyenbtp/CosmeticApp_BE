const TagService = require("../services/TagService");

const TagController = {
  async getAll(req, res) {
    try {
      const {
        status,
      } = req.query;

      const tags = await TagService.getAllTags(status);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getTagsPaginated(req, res) {
    try {
      const {
        page,
        limit,
        q,
        status,
      } = req.query;

      const result = await TagService.getTagsPaginated({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        status,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const tag = await TagService.getTagById(req.params.id);

      if (!tag) return res.status(404).json({ message: "Tag not found" });

      res.json(tag);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const tag = await TagService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await TagService.updateTag(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Tag not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      if (!["active", "archived"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const updated = await TagService.updateStatus(
        req.params.id,
        status
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

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

module.exports = TagController;