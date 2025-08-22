import { connectMongoose } from "@/lib/db/connection";
import RequestModel from "@/lib/models/request";
import { ServerResponseBuilder } from "@/lib/builders/serverResponseBuilder";
import { ResponseType } from "@/lib/types/apiResponse";
import { PAGINATION_PAGE_SIZE } from "@/lib/constants/config";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await connectMongoose();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");

    if (page <= 0) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }

    const filter: Record<string, string> = {};
    if (status) filter.status = status;

    const items = await RequestModel.find(filter)
      .sort({ createdDate: -1 })
      .skip((page - 1) * PAGINATION_PAGE_SIZE)
      .limit(PAGINATION_PAGE_SIZE)
      .lean();

    const total = await RequestModel.countDocuments(filter);

    return new Response(
      JSON.stringify({
        page,
        pageSize: PAGINATION_PAGE_SIZE,
        total,
        hasNext: page * PAGINATION_PAGE_SIZE < items.length,
        items,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function PUT(request: Request) {
  try {
    await connectMongoose();

    const { requestorName, itemRequested } = await request.json();

    const document = await RequestModel.create({
      requestorName,
      itemRequested,
      // Status defaults to pending
    });

    return new Response(JSON.stringify(document), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch  {
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function PATCH(request: Request) {
  try {
    await connectMongoose();

    const body = await request.json();

    // Batch editing
    if (Array.isArray(body?.ids)) {
      if (!body.status) {
        return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
      }

      const ops = body.ids.map((id: string) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { status: body.status } },
        },
      }));
      const result = await RequestModel.bulkWrite(ops, { ordered: false });
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id, status } = body;
    if (!mongoose.isValidObjectId(id)) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }

    const updated = await RequestModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!updated) {
      return new ServerResponseBuilder(ResponseType.NOT_FOUND).build();
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}

export async function DELETE(request: Request) {
  try {
    await connectMongoose();

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return new ServerResponseBuilder(ResponseType.INVALID_INPUT).build();
    }

    const result = await RequestModel.deleteMany({
      _id: { $in: ids },
    });

    return new Response(JSON.stringify({ deletedCount: result.deletedCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
  }
}
