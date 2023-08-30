import { CreateRoomButton } from "@/components/client/room-form-buttons";
import { createRoom } from "@/lib/server-actions/room";

export default function Home() {
  return (
    <main className="flex items-center justify-center">
      <div className="m-4 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <form className="flex flex-col gap-2" action={createRoom}>
            <input
              className="rounded-xl bg-blue-100 p-2 text-gray-900 outline-none placeholder:text-gray-600 hover:bg-blue-200 focus:bg-blue-200"
              placeholder="Room Name"
              type="text"
              name="roomName"
            />
            <input type="hidden" value={"0"} name="ownerId" />
            <CreateRoomButton type="submit" className="px-4 py-2" />
          </form>
        </div>
      </div>
    </main>
  );
}
