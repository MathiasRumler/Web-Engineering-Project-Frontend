/**
 * Calculates the possible print sizes for an image.
 *
 * @param img An Image object. Note: if the image is not fully loaded yet, results might be unexpected.
 * @returns A dictionary with fitting sizes for small, medium and large prints.
 *          The keys are 'S', 'M' and 'L' and the entries are two-element arrays [w,h] of width and height.
 */
export function getPrintSizes(img) {
  let S = [297, 297]; // A4
  let M = [420, 420]; // A3
  let L = [594, 594]; // A2

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  if (h > w) {
    S[0] = Math.floor(w * S[1] / h);
    M[0] = Math.floor(w * M[1] / h);
    L[0] = Math.floor(w * L[1] / h);
  } else {
    S[1] = Math.floor(h * S[0] / w);
    M[1] = Math.floor(h * M[0] / w);
    L[1] = Math.floor(h * L[0] / w);
  }

  return { S: S, M: M, L: L };
}

/**
 * Renders an image within a given square container as a print of a certain size, with a frame and a mat.
 *
 * @param img An Image object. Note: if the image is not fully loaded yet, results might be unexpected.
 * @param container The object that contains the Image.
 * @param printSize The size of the print, either 'S', 'M' or 'L'.
 * @param frameStyle The type of frame, as a string.
 * @param frameWidth The width of the frame, in millimeters.
 * @param matColor The color of the mat, as a string.
 * @param matWidth The width of the mat, in millimeters.
 */
export function render(img, container, printSize, frameStyle, frameWidth, matColor, matWidth) {
  const printSizes = getPrintSizes(img);
  const w = printSizes[printSize][0];
  const h = printSizes[printSize][1];

  let x;
  if (w > h) {
    x = container.offsetWidth / (w + 2 * matWidth + 2 * frameWidth);
  } else {
    x = container.offsetHeight / (h + 2 * matWidth + 2 * frameWidth);
  }

  const frameImageSlices = {
    classic: 115,
    natural: 75,
    shabby: 120,
    elegant: 107
  };

  const matColors = {
    arctic: '#f4f3ef',
    ivory: '#fffff0',
    mint: '#e3efe2',
    indigo: '#264348',
    mauve: '#673147'
  };

  img.style.boxSizing = 'border-box';
  img.width = (w + 2 * matWidth + 2 * frameWidth) * x;
  img.height = (h + 2 * matWidth + 2 * frameWidth) * x;
  img.style.borderImageSource = `url(frame-styles/${frameStyle}.jpg)`;
  img.style.borderImageSlice = frameImageSlices[frameStyle];
  img.style.borderWidth = `${frameWidth * x}px`;
  img.style.backgroundColor = matColors[matColor];
  img.style.padding = `${matWidth * x}px`;
  //console.log(img);
}

/**
 * Returns the price of a given frame configuration in euro cents.
 *
 * @param printSize The size of the print, either 'S', 'M' or 'L'.
 * @param frameStyle The type of frame, as a string.
 * @param frameWidth The width of the frame, in millimeters.
 * @param matWidth The width of the mat, in millimeters.
 */
export function calculatePrice(printSize, frameStyle, frameWidth, matWidth) {
  const frameCost = { 'classic': 100, 'natural': 80, 'shabby': 90, 'elegant': 85, };
  const sizeMultiplier = { 'S': 1, 'M': 2, 'L': 3 };
  return (3000 + frameCost[frameStyle] * frameWidth + 5 * matWidth) * sizeMultiplier[printSize];
}
