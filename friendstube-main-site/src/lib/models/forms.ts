import z from "zod";

export const CreateRoomFormSchema = z.object({
  ownerId: z.string().nonempty(),
  roomName: z.string().nonempty(),
});

export const DeleteRoomFormSchema = z.object({
  roomId: z.coerce.number(),
});

export const JoinRoomFormSchema = z.object({
  roomId: z.coerce.number(),
});

export type CreateRoomFormOptions = z.infer<typeof CreateRoomFormSchema>;
export type DeleteRoomFormOptions = z.infer<typeof DeleteRoomFormSchema>;
export type JoinRoomFormOptions = z.infer<typeof JoinRoomFormSchema>;
