const Counter = require('../models/Counter');

async function generateCode({
  entity,
  prefix,
  year = new Date().getFullYear(),
  pad = 4,
  separator = '-',
  session
}) {
  const key = `${entity}_${prefix}_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return [
    prefix,
    year,
    String(counter.seq).padStart(pad, '0')
  ].join(separator);
}

module.exports = generateCode;