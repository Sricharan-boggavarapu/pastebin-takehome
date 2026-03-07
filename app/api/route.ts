import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const body = await req.json();

  const { content, expire_after_views, expire_after_seconds } = body;

  if (!content) {
    return new Response("Content is required", { status: 400 });
  }

  const id = nanoid(8);

  let expireAt = null;

  if (expire_after_seconds) {
    expireAt = new Date(Date.now() + expire_after_seconds * 1000);
  }

  const paste = await prisma.paste.create({
    data: {
      id,
      content,
      expireAt,
      maxViews: expire_after_views ?? null,
    },
  });

  return Response.json({
    id: paste.id,
    url: `${new URL(req.url).origin}/api?id=${paste.id}`,
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) {
    return new Response("Paste not found", { status: 404 });
  }

  if (paste.expireAt && new Date() > paste.expireAt) {
    return new Response("Paste expired", { status: 410 });
  }

  if (paste.maxViews && paste.views >= paste.maxViews) {
    return new Response("View limit reached", { status: 410 });
  }

  await prisma.paste.update({
    where: { id },
    data: { views: paste.views + 1 },
  });

  return Response.json({
    content: paste.content,
    views: paste.views + 1,
  });
}