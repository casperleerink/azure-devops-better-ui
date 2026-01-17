import { ClientOnly, Link } from "@tanstack/react-router";
import { cva } from "class-variance-authority";
import { BlogCTA } from "~/lib/sanity/sanity.types";
import { PixelLogo } from "../website/pixel-logo";
import LetsTalkMenu from "../website/lets-talk/lets-talk-menu";

const ctaContainerStyles = cva(
  "group md:my-background-grid-0.75 my-background-grid-0.33 relative flex w-full items-center justify-between overflow-hidden rounded-xl bg-[#171B1C] text-[#E7E7E4] transition-colors hover:bg-blue-500 hover:text-white md:rounded-2xl",
  {
    variants: {
      isButton: {
        true: "text-left",
        false: "",
      },
    },
  },
);

const ctaContentStyles = cva("md:p-background-grid-0.25 w-full p-4");

const ctaTitleStyles = cva(
  "text-fluid-grid-xs lg:text-fluid-grid-sm font-semibold",
);

const ctaArrowStyles = cva(
  "text-fluid-grid-sm absolute right-4 bottom-3.5 -translate-x-1 translate-y-1 items-center opacity-0 transition-all duration-200 ease-in-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 lg:right-6 lg:bottom-6",
);

const ctaLogoStyles = cva(
  "h-full w-full max-w-16 self-end !fill-gray-300 opacity-100 transition-all duration-200 ease-in-out group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:opacity-0 lg:max-w-24",
);

export const BlogCTAComponent = ({
  value: { title, showLogo, url, type },
}: {
  value: BlogCTA;
}) => {
  if (type === "contact")
    return (
      <ClientOnly fallback={null}>
        <LetsTalkMenu key={"blog-lets-talk"}>
          <button className={ctaContainerStyles({ isButton: true })}>
            <div className={ctaContentStyles()}>
              <span className={ctaTitleStyles()}>
                {title}
                <span className={ctaArrowStyles()}>↗</span>
              </span>
            </div>
            {showLogo ? <PixelLogo className={ctaLogoStyles()} /> : null}
          </button>
        </LetsTalkMenu>
      </ClientOnly>
    );

  return (
    <Link
      to={url}
      target={type === "external" ? "_blank" : undefined}
      rel={type === "external" ? "noreferrer noopener" : undefined}
      className={ctaContainerStyles({ isButton: false })}
    >
      <div className={ctaContentStyles()}>
        <span className={ctaTitleStyles()}>
          {title}
          <span className={ctaArrowStyles()}>↗</span>
        </span>
      </div>
      {showLogo ? <PixelLogo className={ctaLogoStyles()} /> : null}
    </Link>
  );
};
