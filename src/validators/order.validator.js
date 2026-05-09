function validateCreateOrder(data) {
  const {
    user_id,
    items,
    shipping_fee,
    payment_method,
    receiver_name,
    phone,
    ward,
    district,
    city,
  } = data;

  if (!user_id) {
    throw new Error('User id is required');
  }

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

  /* ---------- SHIPPING FEE ---------- */
  if (shipping_fee !== undefined) {
    if (typeof shipping_fee !== "number" || shipping_fee < 0) {
      throw new Error("shipping fee must be a positive number");
    }
  }

  if (payment_method && !['cod', 'bank_transfer'].includes(payment_method)) {
    throw new Error('Invalid payment method');
  }

  /* ---------- ADDRESS ---------- */  
  if (!receiver_name || !receiver_name.trim()) {
    throw new Error('Receiver name cannot be empty');
  }

  if (!phone) {
    throw new Error('Phone number is required');
  }
  else {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number');
    }
  }

  if (!ward || !ward.trim()) {
    throw new Error('Ward cannot be empty');
  }
  if (!district || !district.trim()) {
    throw new Error('District cannot be empty');
  }
  if (!city || !city.trim()) {
    throw new Error('City cannot be empty');
  }
}

module.exports = {
  validateCreateOrder,
};
