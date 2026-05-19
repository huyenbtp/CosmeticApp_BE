const Counter = require('../models/Counter');

async function generateCode({
  entity,
  pad = 6,
  session
}) {
  const key = `${entity}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return String(counter.seq).padStart(pad, '0');
}

module.exports = generateCode;