function zeros(length) {
  const arr = [];
  for (let i = 0; i < length; i++) {
    arr.push(0);
  }
  return arr;
}

export function toFixed(value, precision) {
  if (isNaN(value) || !isFinite(value)) {
    return String(value);
  }

  //const splitValue = splitNumber(value);
  const rounded =
    typeof precision === "number"
      ? roundDigits(splitValue, splitValue.exponent + 1 + precision)
      : splitValue;

  let c = rounded.coefficients;
  let p = rounded.exponent + 1; // exponent may have changed

  // append zeros if needed
  const pp = p + (precision || 0);
  if (c.length < pp) {
    c = c.concat(zeros(pp - c.length));
  }

  // prepend zeros if needed
  if (p < 0) {
    c = zeros(-p + 1).concat(c);
    p = 1;
  }

  // insert a dot if needed
  if (p < c.length) {
    c.splice(p, 0, p === 0 ? "0." : ".");
  }

  return c.join("");
}
