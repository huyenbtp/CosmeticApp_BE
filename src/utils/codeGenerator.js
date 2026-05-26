const Counter = require('../models/Counter');

async function generateCode({
  entity,
  withYearPrefix = false,
  pad = 6,
  session
}) {
  const year = new Date().getFullYear();
  const key = `${entity}${withYearPrefix ? year : ""}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  return (withYearPrefix ? year : "") + String(counter.seq).padStart(pad, '0');
}

module.exports = generateCode;