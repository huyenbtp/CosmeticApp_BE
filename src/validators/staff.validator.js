function validateStaffBase(data) {
  const {
    full_name,
    gender,
    dob,
    phone,
    position,
    staffStatus,
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

  if (gender && !['male', 'female'].includes(gender)) {
    throw new Error('Invalid gender');
  }

  if (position && !['admin', 'warehouse_manager', 'order_processing'].includes(position)) {
    throw new Error('Invalid position');
  }

  if (staffStatus && !['active', 'on_leave', 'terminated'].includes(staffStatus)) {
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

  const { username, password } = data;

  if (!username || !username.trim()) {
    throw new Error('Username is required');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  if (username.length < 4 || /\s/.test(username)) {
    throw new Error('Username must be at least 4 characters and contain no spaces');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
}

function validateUpdateStaff(data) {
  validateStaffBase(data);
    console.log(data)

  if ('staff_code' in data || 'username' in data || 'password' in data) {
    throw new Error('Staff code, username and password cannot be updated here');
  }
}

module.exports = {
  validateStaffBase,
  validateCreateStaff,
  validateUpdateStaff
};