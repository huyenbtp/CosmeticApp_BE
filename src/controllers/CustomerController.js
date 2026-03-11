const CustomerService = require("../services/CustomerService");

class CustomerController {
  async create(req, res) {
    try {
      const customer = await CustomerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const customers = await CustomerService.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);

      if (!customer) return res.status(404).json({ message: "Customer not found" });

      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomerByPhone(req, res) {
    try {
      const customer = await CustomerService.getCustomerByPhone(req.params.phone);

      res.json(customer || null);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await CustomerService.updateCustomer(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Customer not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await CustomerService.deleteCustomer(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Customer not found" });

      res.json({ message: "Customer deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CustomerController();