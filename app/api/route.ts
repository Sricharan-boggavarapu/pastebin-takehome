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
      // default max views = 5
      maxViews: expire_after_views ?? 5,
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

  // expire by time
  if (paste.expireAt && new Date() > paste.expireAt) {
    return new Response("Paste expired", { status: 410 });
  }

  const newViews = paste.views + 1;

  // expire by views
  if (paste.maxViews && newViews > paste.maxViews) {
    return new Response("View limit reached", { status: 410 });
  }

  await prisma.paste.update({
    where: { id },
    data: { views: newViews },
  });

  return new Response(
    `${paste.content}\n\nViews: ${newViews}`,
    {
      headers: { "Content-Type": "text/plain" },
    }
  );
}