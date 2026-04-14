export const encodeRLE = (arr) => {
  const encoded = [];
  let currentVal = 0; 
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === currentVal) {
      count++;
    } else {
      encoded.push(count);
      count = 1;
      currentVal = arr[i];
    }
  }
  encoded.push(count);
  return encoded;
};

export const decodeRLE = (encoded, totalSize) => {
  const decoded = new Uint8Array(totalSize);
  let currentVal = 0;
  let index = 0;
  for (let i = 0; i < encoded.length; i++) {
    const count = encoded[i];
    if (index + count > totalSize) break;
    decoded.fill(currentVal, index, index + count);
    index += count;
    currentVal = 1 - currentVal; 
  }
  return decoded;
};