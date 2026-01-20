import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
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
          background: "#FDF8F3",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wine/maroon heart (left, behind) */}
          <path
            fill="#722F37"
            d="M11 22.5l-1.1-1C5.3 17.5 2.5 15 2.5 11.8C2.5 9.2 4.5 7.2 7 7.2c1.4 0 2.7.6 3.6 1.7c.9-1 2.2-1.7 3.6-1.7c2.5 0 4.5 2 4.5 4.6c0 3.2-2.8 5.8-7 9.7z"
          />
          {/* Gold heart (right, in front) */}
          <path
            fill="#C9A962"
            d="M21.5 25l-1.1-1c-4.6-4-7.4-6.5-7.4-9.7c0-2.6 2-4.6 4.5-4.6c1.4 0 2.7.6 3.6 1.7c.9-1 2.2-1.7 3.6-1.7c2.5 0 4.5 2 4.5 4.6c0 3.2-2.8 5.8-7 9.7z"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
