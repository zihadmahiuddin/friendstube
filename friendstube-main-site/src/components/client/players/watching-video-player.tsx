"use client";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

import {
  NowPlaying,
  RoomUpdateSchema,
} from "@/lib/models/room";

import VideoPlayer from "./video-player";

type WatchingVideoPlayerProps = {
  nowPlaying: NowPlaying | null;
  roomId: number;
};

export default function WatchingVideoPlayer({
  nowPlaying,
  roomId,
}: WatchingVideoPlayerProps) {
  const [watchingVideoLink, setWatchingVideoLink] = useState<string | null>(
    nowPlaying?.videoLink || null,
  );
  const [position, setPosition] = useState(
    nowPlaying
      ? calculatePosition(
          nowPlaying.position,
          nowPlaying.lastUpdateAt.getTime(),
        )
      : 0,
  );
  const [paused, setPaused] = useState<boolean>(nowPlaying?.paused || true);

  const playerRef = useRef<ReactPlayer>();

  useEffect(() => {
    playerRef?.current?.seekTo(position / 1000, "seconds");
  }, [position]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_HELPER_API_BASE_URL}/sse/roomUpdates/${roomId}`,
    );
    eventSource.addEventListener("error", (ev) => {
      console.error(ev);
    });

    eventSource.addEventListener("message", (ev) => {
      const messageJson = JSON.parse(ev.data);
      const roomUpdateParseResult = RoomUpdateSchema.safeParse(messageJson);
      if (roomUpdateParseResult.success) {
        switch (roomUpdateParseResult.data.updateType) {
          case "play":
            setWatchingVideoLink(roomUpdateParseResult.data.videoLink);
            setPosition(
              calculatePosition(
                roomUpdateParseResult.data.position,
                roomUpdateParseResult.data.timestamp,
              ),
            );
            break;
          case "pause":
            setPaused(true);
            setPosition(
              calculatePosition(
                roomUpdateParseResult.data.position,
                roomUpdateParseResult.data.timestamp,
              ),
            );
            break;
          case "resume":
            setPaused(false);
            setPosition(
              calculatePosition(
                roomUpdateParseResult.data.position,
                roomUpdateParseResult.data.timestamp,
              ),
            );
            break;
          case "positionChange":
            setPosition(
              calculatePosition(
                roomUpdateParseResult.data.position,
                roomUpdateParseResult.data.timestamp,
              ),
            );
            break;
        }
      } else {
        console.error(roomUpdateParseResult.error);
      }
    });
  }, [roomId, nowPlaying]);

  return watchingVideoLink ? (
    <VideoPlayer ref={playerRef} playing={!paused} url={watchingVideoLink} />
  ) : null;
}

function calculatePosition(positionFromServer: number, timestamp: number) {
  const timeSinceLastUpdate = Date.now() - timestamp;
  return positionFromServer + timeSinceLastUpdate;
}
