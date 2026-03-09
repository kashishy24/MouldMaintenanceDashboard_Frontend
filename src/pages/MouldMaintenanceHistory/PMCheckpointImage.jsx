import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../partials/DashboardLayout";
import axios from "axios";

export default function PMCheckpointImages() {

  const [searchParams] = useSearchParams();

  const mouldName =
    searchParams.get("mouldName") ||
    searchParams.get("mouldname") ||
    "";
  const instance = searchParams.get("instance");

  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const guessMimeFromBase64 = (base64) => {
    const s = (base64 || "").replace(/\s/g, "");
    if (s.startsWith("/9j/")) return "image/jpeg";
    if (s.startsWith("iVBORw0KGgo")) return "image/png";
    if (s.startsWith("R0lGOD")) return "image/gif";
    if (s.startsWith("UklGR")) return "image/webp";
    if (s.startsWith("Qk")) return "image/bmp";
    return "image/jpeg";
  };

  const uint8ToBase64 = (u8) => {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      binary += String.fromCharCode(...u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  const hexToBase64 = (hex) => {
    const clean = (hex || "").trim().replace(/^0x/i, "").replace(/\s/g, "");
    if (!clean) return null;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    return uint8ToBase64(bytes);
  };

  const toDataUrl = (imageValue) => {
    if (!imageValue) return null;

    // Already a data URL
    if (typeof imageValue === "string" && imageValue.startsWith("data:image/")) {
      return imageValue;
    }

    // Base64 string or hex string
    if (typeof imageValue === "string") {
      const trimmed = imageValue.trim();
      const base64 = trimmed.startsWith("0x") ? hexToBase64(trimmed) : trimmed.replace(/\s/g, "");
      if (!base64) return null;
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }

    // Node Buffer JSON shape: { type: 'Buffer', data: number[] }
    if (typeof imageValue === "object" && imageValue?.type === "Buffer" && Array.isArray(imageValue?.data)) {
      const base64 = uint8ToBase64(new Uint8Array(imageValue.data));
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }

    // Some serializers may omit `type` and just send { data: number[] }
    if (typeof imageValue === "object" && Array.isArray(imageValue?.data)) {
      const base64 = uint8ToBase64(new Uint8Array(imageValue.data));
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }

    // Or send the raw number[] directly
    if (Array.isArray(imageValue) && imageValue.every((n) => typeof n === "number")) {
      const base64 = uint8ToBase64(new Uint8Array(imageValue));
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }

    // Typed arrays / ArrayBuffer
    if (imageValue instanceof Uint8Array) {
      const base64 = uint8ToBase64(imageValue);
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }
    if (imageValue instanceof ArrayBuffer) {
      const base64 = uint8ToBase64(new Uint8Array(imageValue));
      const mime = guessMimeFromBase64(base64);
      return `data:${mime};base64,${base64}`;
    }

    return null;
  };

  useEffect(() => {

    if (!mouldName || !instance) return;

    const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");
    const url = import.meta.env.DEV
      ? `/api/MouldMaintenanceHistoryPM/PMCheckpointDetails/get-checkpoint-images`
      : `${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/get-checkpoint-images`;
    setErrorMsg("");
    setLoading(true);
    axios
      .get(url, {
        params: { mouldName, instance, _: Date.now() }, // cache buster (avoids 304/empty body issues)
        headers: { "Cache-Control": "no-cache" },
      })
      .then((res) => {
        if (res.data?.status === 200) {
          setImages(Array.isArray(res.data.data) ? res.data.data : []);
        } else {
          setErrorMsg(res.data?.message || "Failed to load images.");
          setImages([]);
        }
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Server error";
        setErrorMsg(msg);
        setImages([]);
      })
      .finally(() => setLoading(false));

}, [mouldName, instance]);

    return (
    <DashboardLayout>
      <div className="p-6">

        <h1 className="text-xl font-bold mb-6">
          Checkpoint Images
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-md">

          <p className="text-sm mb-6">
            <b>Mould Name:</b> {mouldName} |
            <b className="ml-3">Instance:</b> {instance}
          </p>

        {loading ? (
          <div className="text-sm text-gray-500">Loading images...</div>
        ) : errorMsg ? (
          <div className="text-sm text-red-600">{errorMsg}</div>
        ) : images?.length ? (
        <div className="grid grid-cols-7 gap-4">

{images?.map((img, index) => (

  <div
    key={index}
    className="cursor-pointer"
    onClick={() => setPreview(img)}
  >

    <img
      src={toDataUrl(img?.image) || ""}
      className="rounded-lg shadow-md hover:scale-110 transition duration-200 w-full h-24 object-cover"
      alt="checkpoint"
      onError={(e) => {
        e.currentTarget.src = "";
      }}
    />

    <p className="text-xs text-center mt-1 text-gray-500">
      CP {img.checkpoint}
    </p>

  </div>

))}

        </div>
        ) : (
          <div className="text-sm text-gray-500">No images found.</div>
        )}

        </div>

        {/* Image Preview Modal */}
        {preview && (

          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">

            <div className="relative">

              <img
                src={toDataUrl(preview?.image) || ""}
                className="max-w-full max-h-[80vh] rounded-lg"
                alt="checkpoint preview"
                onError={(e) => {
                  e.currentTarget.src = "";
                }}
              />

              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-white px-3 py-1 rounded shadow"
              >
                Close
              </button>

            </div>

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}