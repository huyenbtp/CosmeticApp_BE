const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");

class CustomerService {
  async createCustomer(data) {
    return await Customer.create(data);
  }

  async getCustomers({
    page,
    limit,
    q = "",
    is_active,
  }) {
    const skip = (page - 1) * limit;

    /* ---------- CUSTOMER FILTER ---------- */
    const customerFilter = {};
    //if (status) customerFilter.status = status;

    /* ---------- ACCOUNT FILTER ---------- */
    const userFilter = {};
    if (is_active !== undefined) userFilter["user.is_active"] = is_active === "true";

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { full_name: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      { $match: { ...customerFilter, ...searchFilter } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $match: userFilter },
      {
        $lookup: {
          from: "orders",
          localField: "user_id",          // hoặc user_id tùy bạn thiết kế
          foreignField: "user_id",
          as: "orders",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$orders" },
          totalSpent: {
            $sum: "$orders.total_paid",
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                full_name: 1,
                email: "$user.email",
                is_active: "$user.is_active",
                totalOrders: 1,
                totalSpent: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Customer.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  }

  async getCustomerById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid customer id");
    }

    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      // USER
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // ORDERS (lấy list + stats)
      {
        $lookup: {
          from: "orders",
          let: { userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$user_id", "$$userId"],
                },
              },
            },
            { $sort: { createdAt: -1 } },

            // format order
            {
              $project: {
                _id: 1,
                order_code: 1,
                total_items: 1,
                total_estimated: 1,
                payment_method: 1,
                order_status: 1,
                createdAt: 1,
              },
            },
          ],
          as: "orders",
        },
      },

      // USER ADDRESSES
      {
        $lookup: {
          from: "useraddresses", // ⚠️ check lại tên collection
          localField: "user_id",
          foreignField: "user_id",
          as: "userAddressList",
        },
      },

      // STATS
      {
        $addFields: {
          totalOrders: { $size: "$orders" },

          totalSpent: {
            $sum: "$orders.total_paid",
          },

          lastOrder: {
            $cond: [
              { $gt: [{ $size: "$orders" }, 0] },
              { $arrayElemAt: ["$orders.createdAt", 0] },
              null,
            ],
          },
        },
      },

      // AVG ORDER
      {
        $addFields: {
          averageOrderValue: {
            $cond: [
              { $gt: ["$totalOrders", 0] },
              { $divide: ["$totalSpent", "$totalOrders"] },
              0,
            ],
          },
        },
      },

      // FINAL FORMAT
      {
        $project: {
          _id: 1,
          full_name: 1,
          gender: 1,
          phone: 1,
          dob: 1,
          createdAt: 1,

          user: {
            _id: "$user._id",
            email: "$user.email",
            is_active: "$user.is_active",
            is_verified: "$user.is_verified",
          },

          lastOrder: 1,
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: 1,

          orders: 1,
          userAddressList: {
            _id: 1,
            receiver_name: 1,
            phone: 1,
            address_line: 1,
            ward: 1,
            district: 1,
            city: 1,
            is_default: 1,
          },
        },
      },
    ];

    const result = await Customer.aggregate(pipeline);

    if (!result.length) {
      throw new Error("Customer not found");
    }

    return result[0];
  }

  async getCustomerByPhone(phone) {
    return await Customer.findOne({ phone });
  }

  async updateCustomer(id, updateData) {
    return await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteCustomer(id) {
    return await Customer.findByIdAndDelete(id);
  }
}

module.exports = new CustomerService();