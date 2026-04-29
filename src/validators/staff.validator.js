function validateStaffBase(data) {
  const {
    full_name,
    gender,
    dob,
    phone,
    status,
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

  if (status && !['active', 'on_leave', 'terminated'].includes(status)) {
    throw new Error('Invalid staff status');
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
function validateCreateStaff(data) {
  validateStaffBase(data);

  const { email, password, role_id } = data;

  if (!email || !email.trim()) {
    throw new Error('Email is required');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  if (!role_id) {
    throw new Error('Role is required');
  }
}

function validateUpdateStaff(data) {
  validateStaffBase(data);
    console.log(data)

  if ('staff_code' in data || 'email' in data || 'password' in data) {
    throw new Error('Staff code, email and password cannot be updated here');
  }
}

module.exports = {
  validateStaffBase,
  validateCreateStaff,
  validateUpdateStaff
};