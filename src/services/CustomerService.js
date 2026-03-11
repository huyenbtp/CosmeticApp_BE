const Customer = require("../models/Customer");

class CustomerService {
  async createCustomer(data) {
    return await Customer.create(data);
  }

  async getAllCustomers() {
    return await Customer.find();
  }

  async getCustomerById(id) {
    return await Customer.findById(id);
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