"use client";

import { forwardRef } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";

type VideoPlayerProps = ReactPlayerProps;

const VideoPlayer: React.FC<VideoPlayerProps> = forwardRef<
  ReactPlayer,
  VideoPlayerProps
>((props, ref) => {
  return <ReactPlayer ref={ref} {...props} />;
});

export default VideoPlayer;
