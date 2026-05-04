const mongoose = require("mongoose");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Customer = require("../models/Customer");

class UserService {
  async updatePersonalProfile(id, updateData, isCustomer = false) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(id).populate("role_id").session(session);
      if (!user)
        throw new Error("User not found");

      let { image, currentPass, ...remainingData } = updateData;
      let profile;

      if (isCustomer) {                                                               //update customer
        profile = await Customer.findOne({ user_id: user._id }).session(session);
        if (!profile)
          throw new Error("Customer not found").session(session);
      } else {                                                                        //update staff
        profile = await Staff.findOne({ user_id: user._id }).session(session);
        if (!profile)
          throw new Error("Staff not found").session(session);

        // image logic
        if ("image" in updateData) {
          const oldImage = profile.image;

          // XÓA ẢNH
          if (image === "null" && oldImage) {
            const publicId = getPublicIdFromUrl(oldImage);
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
            }
            profile.image = "";
          }

          // CẬP NHẬT ẢNH MỚI
          else if (typeof image === "string" && image !== oldImage) {
            if (oldImage) {
              const publicId = getPublicIdFromUrl(oldImage);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            }
            profile.image = image;
          }
        }
      }

      // ===== UPDATE PROFILE DATA =====
      Object.keys(remainingData).forEach((key) => {
        if (key !== "image" && key !== "staff_code" && key !== "status") {
          profile[key] = updateData[key];
        }
      });

      await profile.save({ session });

      await session.commitTransaction();

      return {
        email: user.email,
        role: user.role_id.name,
        profile
      };

    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async changeUserStatus(id, is_active) {
    return await User.findByIdAndUpdate(id, { is_active });
  }
}

module.exports = new UserService();