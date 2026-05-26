const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const CartItem = require("../models/CartItem");
const WishlistItem = require("../models/WishlistItem");
const ProductViewHistory = require("../models/ProductViewHistory");
const ItemSimilarity = require("../models/ItemSimilarity");
const Product = require("../models/Product");

const WEIGHTS = {
  purchase: 1.0,
  cart: 0.7,
  wishlist: 0.5,
  view: 0.2,
};

const RecommendationService = {
  async getRecommendations(userId, limit = 10) {
    const basket = new Map();

    // helper
    const addWeight = (productId, weight) => {
      const key = productId.toString();

      basket.set(
        key,
        (basket.get(key) || 0) + weight
      );
    };

    // PURCHASE HISTORY
    const orders = await Order.find({
      user_id: userId,
    })
    .select("_id")
    .lean();

    const orderIds = orders.map(o => o._id);

    const orderItems = await OrderItem.find({
      order_id: { $in: orderIds }
    }).lean();

    const purchasedItemIds = new Set();

    orderItems.forEach((item) => {
      if (item.order_id) {
        addWeight(
          item.product_id,
          WEIGHTS.purchase
        );
        purchasedItemIds.add(item.product_id.toString());
      }
    });

    // CART
    const cartItems = await CartItem.find({ user_id: userId, }).select("product_id").lean();

    cartItems.forEach((item) => {
      addWeight(
        item.product_id,
        WEIGHTS.cart
      );
    });

    // WISHLIST
    const wishlistItems = await WishlistItem.find({ user_id: userId, }).select("product_id").lean();

    wishlistItems.forEach((item) => {
      addWeight(
        item.product_id,
        WEIGHTS.wishlist
      );
    });

    // VIEW HISTORY
    const viewedItems = await ProductViewHistory.find({ user_id: userId, })
      .sort({ last_viewed_at: -1, })
      .limit(20)
      .select("product_id")
      .lean();

    viewedItems.forEach((item) => {
      addWeight(
        item.product_id,
        WEIGHTS.view
      );
    });

    // COLD START
    if (basket.size === 0) {
      return this.getNewestProducts(limit);
    }

    // LOAD SIMILARITIES
    const productIds = [...basket.keys()];

    const similarities = await ItemSimilarity.find({
      item_id: { $in: productIds, },
    }).lean();

    // CALCULATE SCORES
    const scores = new Map();

    similarities.forEach((doc) => {
      const sourceProductId = doc.item_id.toString();

      const sourceWeight = basket.get(sourceProductId) || 0;

      doc.similarItems.forEach((sim) => {
        const targetId =
          sim.similar_item_id.toString();

        // skip purchased items
        if (purchasedItemIds.has(targetId)) {
          return;
        }

        scores.set(
          targetId,
          (scores.get(targetId) || 0) +
          sourceWeight * sim.score
        );
      });
    });

    /*
    if (scores.size < limit) {
      return this.getNewestProducts(limit);
    }
    */
    //console.log(scores)

    // SORT TOP-N PRODUCTS
    const sortedIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    let finalIds = [...sortedIds];

    // fallback fill
    if (finalIds.length < limit) {
      const fallbackProducts = await this.getNewestProducts(limit * 2);

      fallbackProducts.forEach((p) => {
        const id = p._id.toString();

        if (!finalIds.includes(id) && !purchasedItemIds.has(id)) {
          finalIds.push(id);
        }
      });
    }

    // final limit
    finalIds = finalIds.slice(0, limit);

    // LOAD PRODUCTS
    const products = await Product.find({
      _id: { $in: finalIds, },
      status: "published",
    })
      .populate("brand_id", "name")
      .lean();

    // preserve ranking
    const productMap = new Map();

    products.forEach((p) => {
      productMap.set(
        p._id.toString(),
        {
          _id: p._id,
          name: p.name,
          selling_price: p.selling_price,
          image: p.image,
          avg_rating: p.avg_rating,
          brand: p.brand_id.name,
          score: scores.get(p._id.toString()) || 0
        }
      );
    });

    return finalIds
      .map((id) => productMap.get(id))
      .filter(Boolean);
  },

  async getNewestProducts(limit = 10) {
    const res = await Product.find({ status: "published", })
      .limit(limit)
      .populate("brand_id", "name")
      .sort({ createdAt: -1, });

    return res.map(item => ({
      _id: item._id,
      name: item.name,
      selling_price: item.selling_price,
      image: item.image,
      avg_rating: item.avg_rating,
      brand: item.brand_id.name,
    }))
  }
}

module.exports = RecommendationService