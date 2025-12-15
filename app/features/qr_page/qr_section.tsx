"use client";

import { useMemo, useRef } from "react";
import QRCode from "react-qr-code";
import type { User } from "@supabase/supabase-js";

type Profile = {
  firstName: string;
  lastName: string;
  studentId: string;
};

type QRSectionProps = {
  user: User | null;
  profile: Profile | null;
  showDashboard: boolean;
};

export default function QRSection({
  user,
  profile,
  showDashboard,
}: QRSectionProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = useMemo(() => {
    if (!user || !profile) return "";
    const studentData = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      student_id: profile.studentId,
      uuid: user.id,
    };
    return JSON.stringify(studentData);
  }, [user, profile]);

  const downloadQR = async (format: "png" | "jpg" = "png") => {
    if (!qrRef.current) return;

    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      // Get SVG as string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size (with padding for better quality)
        const padding = 40;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;

        // Fill white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(img, padding, padding);

        // Convert to blob and download
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `attendance-qr-${
              profile?.studentId || "code"
            }.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          format === "jpg" ? "image/jpeg" : "image/png",
          1.0
        );

        URL.revokeObjectURL(svgUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  return (
    <section className="md:w-1/2 px-8 py-8 md:py-10 bg-white flex items-center justify-center">
      <div className="w-full max-w-xs text-center text-[#111827]">
        {showDashboard ? (
          <>
            <div className="rounded-3xl bg-[#fef7f5] shadow-md border-2 border-[#6A0F0F] p-5 flex flex-col items-center">
              <div
                ref={qrRef}
                className="rounded-2xl bg-white p-4 mb-4 border-2 border-[#6A0F0F]"
              >
                <QRCode
                  value={qrValue || "attendance-qr"}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#6A0F0F"
                />
              </div>
              <p className="text-xs font-medium text-[#6A0F0F] uppercase tracking-wide mb-1">
                Attendance QR
              </p>
              <p className="text-[11px] text-[#4b5563]">
                Take a picture or save this QR to use for your class attendance.
              </p>
            </div>
            <p className="mt-4 text-xs text-[#6b7280]">
              Keep this QR private. It is linked to your student ID and will be
              used to mark your presence.
            </p>
            <div className="mt-4 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => downloadQR("png")}
                className="text-sm rounded-full bg-[#6A0F0F] text-white px-4 py-2 shadow-md shadow-[#6A0F0F]/30 hover:bg-[#5A0D0D] transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6b7280]">
              Attendance made simple
            </p>
            <h2 className="text-2xl font-semibold text-[#111827]">
              Sign in to get your{" "}
              <span className="underline decoration-[#6A0F0F]/70">
                personal QR
              </span>
            </h2>
            <p className="text-sm text-[#4b5563]">
              Once you log in or register, we&apos;ll generate a unique QR code
              for you to scan in class. No more paper sheets or manual checking.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
