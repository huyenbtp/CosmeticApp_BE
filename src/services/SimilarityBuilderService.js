const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ItemSimilarity = require("../models/ItemSimilarity");

const K = 20;
const ALPHA = 0.5;

class SimilarityBuilderService {
  static async buildSimilarityModel() {
    try {

      console.log("Building item similarity model...");

      // 1. LOAD ORDERS
      const completedOrders = await Order.find({}).select("_id");

      const orderIds = completedOrders.map(
        (o) => o._id
      );

      // 2. LOAD ORDER ITEMS
      const orderItems = await OrderItem.find({
        order_id: {
          $in: orderIds,
        },
      }).select("order_id product_id");

      // 3. BUILD: order -> products[]
      const orderMap = new Map();

      orderItems.forEach((item) => {
        const orderId =
          item.order_id.toString();

        const productId =
          item.product_id.toString();

        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, new Set());
        }

        orderMap
          .get(orderId)
          .add(productId);
      });

      // ITEM FREQUENCY
      // Freq(i)
      const itemFrequency = new Map();

      // CO-OCCURRENCE
      // Freq(i ∩ j)
      const coOccurrence = new Map();

      // BUILD FREQUENCIES
      for (const productsSet of orderMap.values()) {

        const products = [...productsSet];

        // item frequency
        products.forEach((productId) => {
          itemFrequency.set(
            productId,
            (itemFrequency.get(productId) || 0) + 1
          );
        });

        // co-occurrence
        for (let i = 0; i < products.length; i++) {
          for (let j = 0; j < products.length; j++) {
            if (i === j) continue;

            const itemA = products[i];
            const itemB = products[j];

            const key =
              `${itemA}:${itemB}`;

            coOccurrence.set(
              key,
              (coOccurrence.get(key) || 0) + 1
            );
          }
        }
      }

      // BUILD SIMILARITY MAP
      const similarityMap = new Map();

      for (const [key, intersectionFreq,] of coOccurrence.entries()) {

        const [itemA, itemB] = key.split(":");

        const freqA = itemFrequency.get(itemA) || 1;
        const freqB = itemFrequency.get(itemB) || 1;

        // CONDITIONAL PROBABILITY
        const similarityScore =
          intersectionFreq / (freqA * Math.pow(freqB, ALPHA));

        if (!similarityMap.has(itemA)) {
          similarityMap.set(itemA, []);
        }

        similarityMap.get(itemA).push({
          similar_item_id: itemB,
          score: similarityScore,
        });
      }

      // SAVE TO DATABASE
      await ItemSimilarity.deleteMany({});

      for (const [itemId, similarItems,] of similarityMap.entries()) {

        // sort desc
        similarItems.sort((a, b) => b.score - a.score);

        // top K
        const topKItems = similarItems.slice(0, K);

        // normalize
        const totalScore =
          topKItems.reduce((sum, item) => sum + item.score, 0);

        const normalizedItems = topKItems.map((item) => ({
          similar_item_id: item.similar_item_id,
          score: totalScore > 0 ? item.score / totalScore : 0,
        }));

        await ItemSimilarity.create({
          item_id: itemId,
          similarItems:
            normalizedItems,
        });
      }

      console.log(
        "Item similarity model built successfully."
      );

      return true;

    } catch (error) {
      console.error("Build similarity model failed:", error);
      throw error;
    }
  }
}

module.exports = SimilarityBuilderService;