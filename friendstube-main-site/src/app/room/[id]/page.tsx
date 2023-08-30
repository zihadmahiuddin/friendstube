import { notFound } from "next/navigation";
import z from "zod";

import { DeleteRoomButton } from "@/components/client/room-form-buttons";
import RoomPlayForm from "@/components/client/room-play-form";
import prisma from "@/lib/prisma";
import { deleteRoom } from "@/lib/server-actions/room";

const RoomPagePropsSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
});

type RoomPageProps = z.infer<typeof RoomPagePropsSchema>;

export default async function Room(props: RoomPageProps) {
  const propsResult = RoomPagePropsSchema.safeParse(props);
  if (!propsResult.success) {
    console.error(propsResult.error);
    return notFound();
  }

  const room = await prisma.room.findUnique({
    where: {
      id: propsResult.data.params.id,
    },
    include: {
      nowPlaying: true,
    },
  });

  if (!room) {
    return notFound();
  }

  return (
    <main className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-4">
          <p>{room.name}</p>
          <form action={deleteRoom}>
            <input type="hidden" name="roomId" value={room.id} />
            <DeleteRoomButton className="px-4 py-2" />
          </form>
        </div>
        <RoomPlayForm roomId={room.id} nowPlaying={room.nowPlaying} />
      </div>
    </main>
  );
}
