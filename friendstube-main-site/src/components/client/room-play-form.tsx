"use client";

import { useState } from "react";

import { NowPlaying } from "../../lib/models/room";
import {
  roomContentChosen,
  roomContentPaused,
  roomContentResumed,
  roomContentSeeked,
} from "@/lib/server-actions/room";

import Button from "./button";
import WatchingVideoPlayer from "./players/watching-video-player";
import HostingVideoPlayer from "./players/hosting-video-player";

type RoomPlayFormProps = {
  roomId: number;
  nowPlaying: NowPlaying | null;
};

export default function RoomPlayForm({
  roomId,
  nowPlaying,
}: RoomPlayFormProps) {
  const [videoLink, setVideoLink] = useState("");
  const [playingVideoLink, setPlayingVideoLink] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const onPlayClick = async () => {
    await roomContentChosen(roomId, videoLink, Date.now());
    setPlayingVideoLink(videoLink);
  };

  const onFollowClick = () => {
    setIsWatching(true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {!playingVideoLink && !isWatching ? (
        <div className="flex items-center justify-center gap-2">
          <input
            type="url"
            placeholder="Link"
            className="rounded-xl p-2 outline-none"
            value={videoLink}
            onChange={(ev) => setVideoLink(ev.target.value)}
          />
          <Button onClick={onPlayClick} className="px-4 py-2">
            Play
          </Button>
        </div>
      ) : null}
      {!isWatching && !playingVideoLink ? (
        <Button onClick={onFollowClick} className="px-4 py-2">
          Follow
        </Button>
      ) : null}
      {!isWatching && playingVideoLink ? (
        <HostingVideoPlayer
          url={playingVideoLink}
          onPaused={async (timestamp, position) => {
            await roomContentPaused(
              roomId,
              timestamp,
              Math.round(position * 1000),
            );
          }}
          onResumed={async (timestamp, position) => {
            await roomContentResumed(
              roomId,
              timestamp,
              Math.round(position * 1000),
            );
          }}
          onSeeked={async (timestamp, _oldPosition, newPosition) => {
            await roomContentSeeked(
              roomId,
              timestamp,
              Math.round(newPosition * 1000),
            );
          }}
        />
      ) : isWatching ? (
        <WatchingVideoPlayer nowPlaying={nowPlaying} roomId={roomId} />
      ) : null}
    </div>
  );
}
