const WishlistItemService = require("../services/WishlistItemService");

class WishlistItemController {
  async create(req, res) {
    try {
      const wishlistItem = await WishlistItemService.createWishlistItem(req.body);
      res.status(201).json(wishlistItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const wishlistItems = await WishlistItemService.getAllWishlistItems();
      res.json(wishlistItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const wishlistItem = await WishlistItemService.getWishlistItemById(req.params.id);

      if (!wishlistItem) return res.status(404).json({ message: "WishlistItem not found" });

      res.json(wishlistItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await WishlistItemService.updateWishlistItem(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "WishlistItem not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await WishlistItemService.deleteWishlistItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "WishlistItem not found" });

      res.json({ message: "WishlistItem deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new WishlistItemController();