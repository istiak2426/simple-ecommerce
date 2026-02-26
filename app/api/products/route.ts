import { NextResponse } from "next/server";

let products = [
  { id: 1, name: "Flamingo 20W-50", price: "$12", image: "/images/1.jpeg" },
];

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const newProduct = await req.json();
  products.push({ ...newProduct, id: Date.now() });
  return NextResponse.json(products);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  products = products.filter((p) => p.id !== id);
  return NextResponse.json(products);
}

export async function PUT(req: Request) {
  const updatedProduct = await req.json();
  products = products.map((p) =>
    p.id === updatedProduct.id ? updatedProduct : p
  );
  return NextResponse.json(products);
}