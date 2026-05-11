const WishlistItemService = require("../services/WishlistItemService");

const WishlistItemController = {
  async getAllByUserId(req, res) {
    try {
      const user_id = req.user.userId;

      const result = await WishlistItemService.getAllByUserId(user_id);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const user_id = req.user.userId;
      const { product_id } = req.body;

      const wishlistItem = await WishlistItemService.createWishlistItem(user_id, product_id);

      res.status(201).json({ message: "Wishlist item added" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await WishlistItemService.deleteWishlistItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Wishlist item not found" });

      res.json({ message: "Wishlist item deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = WishlistItemController;