import QRCode from "qrcode";

/**
 * Generates a high-contrast Marvel/Stark-themed QR Code Data URL.
 * Encodes the participant's verify URL so it can be scanned by any smartphone
 * camera or the dedicated organizing team scanner at `/scanner`.
 */
export async function generateQrCodeDataUrl(textOrUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(textOrUrl, {
      errorCorrectionLevel: "H", // Highest reliability even if partially smudged on phone screens
      type: "image/png",
      margin: 1.5,
      scale: 8,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return "";
  }
}

export async function generateQrCodeSvg(textOrUrl: string): Promise<string> {
  try {
    return await QRCode.toString(textOrUrl, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1.5,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR SVG generation error:", err);
    return "";
  }
}
