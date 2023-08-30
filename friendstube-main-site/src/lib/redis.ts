import { createClient } from "redis";

import { RoomUpdate, RoomUpdateSchema } from "./models/room";

const ROOM_UPDATES_CHANNEL_NAME = "roomUpdates";
const REDIS_URL = process.env.REDIS_URL;

const pubClient = createClient({ url: REDIS_URL });

async function pubConnect() {
  if (!pubClient.isOpen) {
    await pubClient.connect();
  }
}

export async function publishRoomUpdate(roomUpdate: RoomUpdate) {
  await pubConnect();

  const parsedRoomUpdate = RoomUpdateSchema.parse(roomUpdate); // make sure the object is valid, just in case

  await pubClient.PUBLISH(
    ROOM_UPDATES_CHANNEL_NAME,
    JSON.stringify(parsedRoomUpdate),
  );
}
