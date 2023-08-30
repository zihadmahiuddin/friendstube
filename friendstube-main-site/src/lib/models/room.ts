import z from "zod";

export const NowPlayingSchema = z.object({
  videoLink: z.string(),
  lastUpdateAt: z.coerce.date(),
  position: z.coerce.number(),
  paused: z.coerce.boolean(),
});

export const RoomSchema = z.object({
  id: z.number(),
  ownerId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  nowPlaying: NowPlayingSchema.optional(),
});

const BaseRoomUpdateSchema = z.object({
  roomId: RoomSchema.shape.id,
  timestamp: z.number(),
  position: z
    .number()
    .gte(0, { message: "New position must be greater than or equal to 0" }),
});

export const RoomUpdateSchema = z.discriminatedUnion("updateType", [
  BaseRoomUpdateSchema.extend({ updateType: z.literal("pause") }),
  BaseRoomUpdateSchema.extend({ updateType: z.literal("resume") }),
  BaseRoomUpdateSchema.extend({
    updateType: z.literal("play"),
    videoLink: z.string().url({ message: "Video link must be a valid URL" }),
  }),
  BaseRoomUpdateSchema.extend({
    updateType: z.literal("positionChange"),
  }),
]);

export type NowPlaying = z.infer<typeof NowPlayingSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type RoomUpdate = z.infer<typeof RoomUpdateSchema>;
