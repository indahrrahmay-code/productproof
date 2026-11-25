
import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secret = process.env.DEVICE_FINGERPRINT_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Fingerprint secret belum dikonfigurasi." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imei } = body;

    if (
      typeof imei !== "string" ||
      !/^[0-9]{15}$/.test(imei)
    ) {
      return NextResponse.json(
        { error: "IMEI harus terdiri dari 15 digit angka." },
        { status: 400 }
      );
    }

    const fingerprint = createHmac("sha256", secret)
      .update(imei)
      .digest("hex");

    return NextResponse.json({
      fingerprint: `0x${fingerprint}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat device fingerprint." },
      { status: 500 }
    );
  }
}
