function validateCustomerBase(data) {
  const {
    full_name,
    gender,
    dob,
    phone,
  } = data;

  if (full_name !== undefined && !full_name.trim()) {
    throw new Error('Full name cannot be empty');
  }

  if (phone !== undefined) {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Invalid phone number');
    }
  }

  if (gender && !['male', 'female', 'other'].includes(gender)) {
    throw new Error('Invalid gender');
  }

  if (dob !== undefined) {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid date of birth');
    }
    if (birthDate > new Date()) {
      throw new Error('Date of birth cannot be in the future');
    }
  }
}
function validateCreateCustomer(data) {
  validateCustomerBase(data);

  const { email, password } = data;

  if (!email || !email.trim()) {
    throw new Error('Email is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // regex email chuẩn (đủ dùng production)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Invalid email format");
  }

  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
}

function validateUpdateCustomer(data) {
  validateCustomerBase(data);
  console.log(data)

  if ('email' in data || 'password' in data) {
    throw new Error('Email and password cannot be updated here');
  }
}

module.exports = {
  validateCustomerBase,
  validateCreateCustomer,
  validateUpdateCustomer
};