import { ImageResponse } from "next/og";
import { wedding } from "@/config/wedding";

/** Favicon: the couple's initials on a sindoor disc. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
          background: "#B3001B",
          border: "3px solid #D4AF37",
          color: "#FFF8EE",
          fontSize: 24,
          fontFamily: "serif",
        }}
      >
        {wedding.initials.bride}&amp;{wedding.initials.groom}
      </div>
    ),
    size
  );
}
