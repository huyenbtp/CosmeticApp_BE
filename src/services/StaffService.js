const mongoose = require("mongoose");
const Staff = require("../models/Staff");
const Account = require("../models/User");
const { hashPassword } = require("../utils/hash");
const generateCode = require("../utils/codeGenerator");
const cloudinary = require("../config/cloudinary");
const getPublicIdFromUrl = require("../utils/getImagePublicId");

const StaffService = {
  async getStaffs({
    page,
    limit,
    q = "",
    staffStatus,
    role,
    accountStatus,
  }) {
    //console.log(page, limit, q, staffStatus, role, accountStatus)
    const skip = (page - 1) * limit;

    /* ---------- STAFF FILTER ---------- */
    const staffFilter = {};
    if (staffStatus) staffFilter.status = staffStatus;

    /* ---------- ACCOUNT FILTER ---------- */
    const accountFilter = {};
    if (role) accountFilter["account.role"] = role;
    if (accountStatus) accountFilter["account.status"] = accountStatus;

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
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: { path: "$account", preserveNullAndEmptyArrays: true } },
      { $match: { ...staffFilter, ...accountFilter, ...searchFilter } },
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
                position: 1,
                account: {
                  _id: "$account._id",
                  username: "$account.username",
                  role: "$account.role",
                  status: "$account.status",
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
      .populate("account_id", "username role status createdAt updatedAt");

    if (!staff) throw new Error("Staff not found");

    return {
      _id: staff._id,
      staff_code: staff.staff_code,
      full_name: staff.full_name,
      gender: staff.gender,
      dob: staff.dob,
      phone: staff.phone,
      position: staff.position,
      image: staff.image,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      account: staff.account_id
        ? {
          _id: staff.account_id._id,
          username: staff.account_id.username,
          role: staff.account_id.role,
          status: staff.account_id.status,
          updatedAt: staff.account_id.updatedAt,
        }
        : null,
    };
  },

  async getByIdToEdit(id, isAdmin = false) {
    const staff = await Staff.findById(id)
      .populate("account_id", "role status");

    if (!staff) throw new Error("Staff not found");

    return {
      full_name: staff.full_name,
      gender: staff.gender,
      dob: staff.dob,
      phone: staff.phone,
      image: staff.image,
      ...(isAdmin && {
        status: staff.status,
        position: staff.position,
        account: staff.account_id
          ? {
            role: staff.account_id.role,
            status: staff.account_id.status,
          }
          : null,
      }),
    };
  },

  async create(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log(data)
    try {
      const { username, password, role, accountStatus, staffStatus, ...staffData } = data;

      const existedUsername = await Account.findOne({ username });
      if (existedUsername) throw new Error("username already exists");

      const staffCode = await generateCode({
        entity: "staff",
        prefix: role === "admin" ? "ADM"
          : role === "warehouse_manager" ? "WAM"
            : "OPS",
        session,
      });

      const acc = await Account.create([{
        username,
        password_hash: await hashPassword(password),
        role,
        status: accountStatus
      }], { session });

      const staff = await Staff.create([{
        ...staffData,
        staff_code: staffCode,
        account_id: acc[0]._id,
        status: staffStatus,
      }], { session });

      await session.commitTransaction();
      return staff[0];
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  },

  async update(id, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const staff = await Staff.findById(id).session(session);
      if (!staff)
        throw new Error("Staff not found").session(session);

      const account = await Account.findById(staff.account_id).session(session);
      if (!account)
        throw new Error("Account not found");

      let { role, accountStatus, staffStatus, image, ...staffData } = updateData;

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
        if (key !== "image" && key !== "staff_code" && key !== "staffStatus") {
          staff[key] = updateData[key];
        }
      });
      if (staffStatus) staff.status = staffStatus;

      // ===== UPDATE ACCOUNT DATA =====
      if (role) account.role = role;
      if (accountStatus) account.status = accountStatus;

      await staff.save({ session });
      await account.save({ session });

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

      const accountId = staff.account_id;

      /* ================= XÓA IMAGE ================= */
      if (staff.image) {
        const publicId = getPublicIdFromUrl(staff.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      /* ================= DELETE ================= */
      await Staff.deleteOne({ _id: staffId }).session(session);

      if (accountId) {
        await Account.deleteOne({ _id: accountId }).session(session);
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