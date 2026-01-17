import { cn } from "~/lib/utils";
import { Video } from "../website/media-components";
import { env } from "~/lib/env/env.client";

interface VideoComponentProps {
  value: {
    sourceType: "url" | "file";
    url?: string;
    file?: {
      asset: {
        _ref: string;
      };
    };
    className?: string;
    width?: number;
    height?: number;
    controls?: boolean;
  };
  className?: string;
}

const projectId = env.VITE_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.VITE_PUBLIC_SANITY_DATASET;

function getSanityFileUrl(ref: string) {
  const [, assetId, extension] = ref.split("-");
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${extension}`;
}

export const VideoComponent = ({ value }: VideoComponentProps) => {
  const { sourceType, url, file, className, width, height, controls } = value;

  const aspectRatio = width && height ? width / height : undefined;
  const containerClassName = cn(
    "relative w-full overflow-hidden rounded-xl md:rounded-2xl",
    !aspectRatio && "aspect-video",
    className,
  );
  const containerStyle = aspectRatio ? { aspectRatio } : undefined;

  if (sourceType === "file" && file?.asset?._ref) {
    const fileUrl = getSanityFileUrl(file.asset._ref);
    return (
      <div className={containerClassName} style={containerStyle}>
        <Video
          src={fileUrl}
          width={width}
          height={height}
          controls={controls}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            className,
          )}
        />
      </div>
    );
  }

  if (sourceType === "url" && url) {
    const embedUrl = url.includes("youtube.com/watch")
      ? url.replace("watch?v=", "embed/")
      : url;

    return (
      <div className={containerClassName} style={containerStyle}>
        <Video
          src={embedUrl}
          width={width}
          height={height}
          controls={controls}
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            className,
          )}
        />
      </div>
    );
  }

  return null;
};
