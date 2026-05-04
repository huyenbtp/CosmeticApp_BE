const Tag = require("../models/Tag");

class TagService {
  async createTag(data) {
    return await Tag.create(data);
  }

  async getAllTags() {
    return await Tag.find();
  }

  async getTagById(id) {
    return await Tag.findById(id);
  }

  async updateTag(id, updateData) {
    return await Tag.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteTag(id) {
    return await Tag.findByIdAndDelete(id);
  }
}

module.exports = new TagService();