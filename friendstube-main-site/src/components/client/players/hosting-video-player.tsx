"use client";

import { useState } from "react";

import VideoPlayer from "./video-player";

type HostingVideoPlayerProps = {
  onPaused?: (timestamp: number, position: number) => void;
  onResumed?: (timestamp: number, position: number) => void;
  onSeeked?: (
    timestamp: number,
    oldPosition: number,
    newPosition: number,
  ) => void;
  url: string;
};

export default function HostingVideoPlayer({
  onResumed,
  onPaused,
  onSeeked,
  url,
}: HostingVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <VideoPlayer
      url={url}
      playing={playing}
      onProgress={(progress) => {
        setProgress(progress.playedSeconds);
      }}
      onPlay={() => {
        onResumed?.(Date.now(), progress);
        setPlaying(true);
      }}
      onPause={() => {
        onPaused?.(Date.now(), progress);
        setPlaying(false);
      }}
      onSeek={(newProgress) => {
        onSeeked?.(Date.now(), progress, newProgress);
        setProgress(newProgress);
      }}
      controls
    />
  );
}
