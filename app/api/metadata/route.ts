import { NextResponse } from "next/server";



export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const brand = searchParams.get("brand")?.trim() ?? "";
  const model = searchParams.get("model")?.trim() ?? "";
  const storage = searchParams.get("storage")?.trim() ?? "";
  const color = searchParams.get("color")?.trim() ?? "";
  const condition = searchParams.get("condition")?.trim() ?? "";

  const fields = [brand, model, storage, color, condition];

  if (fields.some((value) => value.length === 0 || value.length > 100)) {
    return NextResponse.json(
      { error: "Metadata produk tidak lengkap atau tidak valid." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    name: brand + " " + model,
    description: "ProductProof Digital Product Passport for " + brand + " " + model + ".",
   external_url: "https://productproof-v3.vercel.app",
    attributes: [
      { trait_type: "Brand", value: brand },
      { trait_type: "Model", value: model },
      { trait_type: "Storage", value: storage },
      { trait_type: "Color", value: color },
      { trait_type: "Condition", value: condition }
    ]
  });

}
