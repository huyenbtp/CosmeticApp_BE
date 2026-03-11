function validateCreateOrder(data) {
  const {
    items,
    points_used,
  } = data;

  /* ---------- ITEMS ---------- */
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order items is required");
  }

  for (const item of items) {
    if (!item.product_id) {
      throw new Error("product_id is required");
    }

    if (item.unit_price === undefined || item.unit_price < 0) {
      throw new Error("unit_price must be >= 0");
    }

    if (!item.quantity || item.quantity <= 0) {
      throw new Error("quantity must be > 0");
    }
  }

  /* ---------- POINTS ---------- */
  if (points_used !== undefined) {
    if (typeof points_used !== "number" || points_used < 0) {
      throw new Error("points_used must be a positive number");
    }
  }
}

module.exports = {
  validateCreateOrder,
};
