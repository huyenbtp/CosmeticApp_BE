const CartItemService = require("../services/CartItemService");

const CartItemController = {
  async getAllByUserId(req, res) {
    try {
      const user_id = req.user.userId;

      const result = await CartItemService.getAllByUserId(user_id);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async addToCart(req, res) {
    try {
      const user_id = req.user.userId;
      const { product_id, quantity } = req.body;

      const cartItem = await CartItemService.addToCart(user_id, product_id, quantity);

      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateQuantity(req, res) {
    try {
      const { quantity } = req.body;

      const updated = await CartItemService.updateQuantity(req.params.id, quantity);

      if (!updated) return res.status(404).json({ message: "Cart item not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await CartItemService.deleteCartItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Cart item not found" });

      res.json({ message: "Cart item deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = CartItemController;