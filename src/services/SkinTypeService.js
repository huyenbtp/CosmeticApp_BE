const SkinType = require("../models/SkinType");

class SkinTypeService {
  async createSkinType(data) {
    return await SkinType.create(data);
  }

  async getAllSkinTypes() {
    return await SkinType.find();
  }

  async getSkinTypeById(id) {
    return await SkinType.findById(id);
  }

  async updateSkinType(id, updateData) {
    return await SkinType.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteSkinType(id) {
    return await SkinType.findByIdAndDelete(id);
  }
}

module.exports = new SkinTypeService();