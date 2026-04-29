const mongoose = require("mongoose");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Role = require("../models/Role");
const generateCode = require("../utils/codeGenerator");
const cloudinary = require("../config/cloudinary");
const getPublicIdFromUrl = require("../utils/getImagePublicId");
const { hashPassword } = require("../utils/hash");
const { signToken, verifyToken } = require("../utils/jwt");
const { sendMail } = require("../utils/mailer.js");
const { setStaffPasswordTemplate } = require("../utils/emailTemplates/setStaffPassword.js");

const StaffService = {
  async getStaffs({
    page,
    limit,
    q = "",
    status,
    role_id,
    is_active,
  }) {
    //console.log(page, limit, q, status, role_id, is_active)
    const skip = (page - 1) * limit;

    /* ---------- STAFF FILTER ---------- */
    const staffFilter = {};
    if (status) staffFilter.status = status;

    /* ---------- ACCOUNT FILTER ---------- */
    const userFilter = {};
    if (role_id) userFilter["user.role_id"] = new mongoose.Types.ObjectId(role_id);
    if (is_active !== undefined) userFilter["user.is_active"] = is_active === "true";

    /* ---------- SEARCH ---------- */
    const searchFilter = q
      ? {
        $or: [
          { full_name: { $regex: q, $options: "i" } },
          { staff_code: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
        ],
      }
      : {};

    /* ---------- AGGREGATE ---------- */
    const pipeline = [
      { $match: { ...staffFilter, ...searchFilter } },
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
          from: "roles",
          localField: "user.role_id",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                staff_code: 1,
                full_name: 1,
                phone: 1,
                user: {
                  _id: "$user._id",
                  email: "$user.email",
                  role: "$role.name",
                  is_active: "$user.is_active",
                },
                status: 1,
                image: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Staff.aggregate(pipeline);

    return {
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page,
        limit,
      },
    };
  },

  async getById(id) {
    const staff = await Staff.findById(id)
      .populate("user_id", "email role_id is_active createdAt updatedAt")

    if (!staff) throw new Error("Staff not found");

    const role = await Role.findById(staff.user_id.role_id);

    return {
      _id: staff._id,
      staff_code: staff.staff_code,
      full_name: staff.full_name,
      gender: staff.gender,
      dob: staff.dob,
      phone: staff.phone,
      image: staff.image,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      user: staff.user_id
        ? {
          _id: staff.user_id._id,
          email: staff.user_id.email,
          role: role.name,
          is_active: staff.user_id.is_active,
          updatedAt: staff.user_id.updatedAt,
        }
        : null,
    };
  },

  async getByIdToEdit(id, isAdmin = false) {
    const staff = await Staff.findById(id)
      .populate("user_id", "role_id is_active");

    if (!staff) throw new Error("Staff not found");

    const role = await Role.findById(staff.user_id.role_id);

    return {
      full_name: staff.full_name,
      gender: staff.gender,
      dob: staff.dob,
      phone: staff.phone,
      image: staff.image,
      ...(isAdmin && {
        status: staff.status,
        user: staff.user_id
          ? {
            role: role.name,
            is_active: staff.user_id.is_active,
          }
          : null,
      }),
    };
  },

  async create(data) {
    let user, staff;

    console.log(data)
    const { email, password, role_id, is_active, ...staffData } = data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existedEmail = await User.findOne({ email }).session(session);
      if (existedEmail) throw new Error("Email already exists");

      const hashed = await hashPassword(password);

      const role = await Role.findById(role_id).session(session);
      if (!role) throw new Error("Role not found");
      if (!["admin", "warehouse_manager", "order_processing"].includes(role.name)) {
        throw new Error("Invalid role for staff");
      }

      const prefixMap = {
        admin: "ADM",
        warehouse_manager: "WAM",
        order_processing: "OPS"
      };
      const prefix = prefixMap[role.name] || "STF";
      const staffCode = await generateCode({
        entity: "staff",
        prefix,
        session,
      });

      const users = await User.create([{
        email,
        password_hash: null,
        role_id,
        is_active,
        is_verified: true
      }], { session });

      user = users[0];

      const staffs = await Staff.create([{
        ...staffData,
        staff_code: staffCode,
        user_id: user._id,
      }], { session });

      staff = staffs[0];

      await session.commitTransaction();

    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    if (!user) {
      console.error("User not created, skip sending email");
      return;
    }

    try {
      // tạo JWT verify token
      const token = signToken(
        {
          user_id: user._id,
          type: "set_password"
        },
        "24h"
      );

      const link = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
      const html = setStaffPasswordTemplate(link, data.full_name);

      const mailOptions = {
        to: email,
        subject: "[Skintify] - Set your password",
        html
      };

      // gửi email
      await sendMail(mailOptions);
    } catch (e) {
      console.error("Send mail failed:", e.message);
    }

    if (!staff) throw new Error("Staff creation failed");
    return staff;
  },

  async update(id, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await Staff.findById(id).session(session);
      if (!staff)
        throw new Error("Staff not found").session(session);

      const user = await User.findById(staff.user_id).session(session);
      if (!user)
        throw new Error("User not found");

      let { role, is_active, image, ...staffData } = updateData;

      // image logic
      if ("image" in updateData) {
        const oldImage = staff.image;

        // XÓA ẢNH
        if (image === "null" && oldImage) {
          const publicId = getPublicIdFromUrl(oldImage);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
          staff.image = "";
        }

        // CẬP NHẬT ẢNH MỚI
        else if (typeof image === "string" && image !== oldImage) {
          if (oldImage) {
            const publicId = getPublicIdFromUrl(oldImage);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
          }
          staff.image = image;
        }
      }

      // ===== UPDATE STAFF DATA =====
      Object.keys(staffData).forEach((key) => {
        if (key !== "image" && key !== "staff_code") {
          staff[key] = updateData[key];
        }
      });

      // ===== UPDATE ACCOUNT DATA =====
      if (role) user.role = role;
      if (is_active) user.is_active = is_active;

      await staff.save({ session });
      await user.save({ session });

      await session.commitTransaction();

      return staff;

    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },

  async deleteStaff(staffId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await Staff.findById(staffId).session(session);
      if (!staff) {
        throw new Error('Staff not found');
      }

      const userId = staff.user_id;

      /* ================= XÓA IMAGE ================= */
      if (staff.image) {
        const publicId = getPublicIdFromUrl(staff.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      /* ================= DELETE ================= */
      await Staff.deleteOne({ _id: staffId }).session(session);

      if (userId) {
        await User.deleteOne({ _id: userId }).session(session);
      }

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },
}

module.exports = StaffService;