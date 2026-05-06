const CartItemService = require("../services/CartItemService");

class CartItemController {
  async create(req, res) {
    try {
      const cartItem = await CartItemService.createCartItem(req.body);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const cartItems = await CartItemService.getAllCartItems();
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const cartItem = await CartItemService.getCartItemById(req.params.id);

      if (!cartItem) return res.status(404).json({ message: "CartItem not found" });

      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await CartItemService.updateCartItem(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "CartItem not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await CartItemService.deleteCartItem(req.params.id);

      if (!deleted) return res.status(404).json({ message: "CartItem not found" });

      res.json({ message: "CartItem deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CartItemController();