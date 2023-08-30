"use server";

import { redirect } from "next/navigation";

import {
  CreateRoomFormSchema,
  DeleteRoomFormSchema,
} from "../models/forms";
import { Room } from "../models/room";
import prisma from "../prisma";
import { publishRoomUpdate } from "../redis";

export async function createRoom(
  formData: FormData,
): Promise<{ success: true; room: Room } | { success: false; error: string }> {
  const parseResult = CreateRoomFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (parseResult.success) {
    const room = await prisma.room.create({
      data: {
        ownerId: parseResult.data.ownerId,
        name: parseResult.data.roomName,
      },
    });
    return redirect(`/room/${room.id}`);
  } else {
    return {
      success: false,
      error: parseResult.error.message,
    };
  }
}

export async function deleteRoom(
  formData: FormData,
): Promise<{ success: true; room: Room } | { success: false; error: string }> {
  // TODO: creator ID check
  const parseResult = DeleteRoomFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (parseResult.success) {
    await prisma.room.delete({
      where: {
        id: parseResult.data.roomId,
      },
      include: {
        nowPlaying: true,
      },
    });
    return redirect(`/`);
  } else {
    return {
      success: false,
      error: parseResult.error.message,
    };
  }
}

export async function roomContentChosen(
  roomId: number,
  contentLink: string,
  timestamp: number,
) {
  await Promise.all([
    publishRoomUpdate({
      updateType: "play",
      roomId,
      timestamp,
      videoLink: contentLink,
      position: 0,
    }),
    prisma.nowPlaying.upsert({
      where: {
        roomId,
      },
      create: {
        videoLink: contentLink,
        lastUpdateAt: new Date(timestamp),
        paused: true,
        position: 0,
        roomId,
      },
      update: {
        videoLink: contentLink,
      },
    }),
  ]);
}

export async function roomContentPaused(
  roomId: number,
  timestamp: number,
  position: number,
) {
  await Promise.all([
    publishRoomUpdate({
      updateType: "pause",
      roomId,
      timestamp,
      position,
    }),
    prisma.nowPlaying.update({
      where: {
        roomId,
      },
      data: {
        paused: true,
        lastUpdateAt: new Date(timestamp),
        position,
      },
    }),
  ]);
}
export async function roomContentResumed(
  roomId: number,
  timestamp: number,
  position: number,
) {
  await Promise.all([
    publishRoomUpdate({
      updateType: "resume",
      roomId,
      timestamp,
      position,
    }),

    prisma.nowPlaying.update({
      where: {
        roomId,
      },
      data: {
        paused: false,
        lastUpdateAt: new Date(timestamp),
        position,
      },
    }),
  ]);
}

export async function roomContentSeeked(
  roomId: number,
  timestamp: number,
  position: number,
) {
  await Promise.all([
    publishRoomUpdate({
      updateType: "positionChange",
      position,
      roomId,
      timestamp,
    }),
    prisma.nowPlaying.update({
      where: {
        roomId,
      },
      data: {
        lastUpdateAt: new Date(timestamp),
        position,
      },
    }),
  ]);
}
