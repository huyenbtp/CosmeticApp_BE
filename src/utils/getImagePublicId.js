function getPublicIdFromUrl(url) {
  if (!url) return null;

  // match phần sau /upload/, bỏ v<number>/ nếu có, bỏ extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);

  return match ? match[1] : null;
}

module.exports = getPublicIdFromUrl;