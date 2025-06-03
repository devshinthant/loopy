import { cn } from "@/lib/utils";

interface Props {
  imageUrl: string;
  local?: boolean;
}

export default function VideoOff({ imageUrl, local = true }: Props) {
  return (
    <div className="bg-[#131314] w-full h-full relative">
      <div
        style={{
          filter: local ? "blur(35.93px)" : "blur(90px)",
        }}
        className={cn(
          "absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ",
          {
            "w-[120%] h-[120%]": !local,
            "w-[110%] h-[110%]": local,
          }
        )}
      >
        <img src={imageUrl} alt="user" className="object-cover w-full h-full" />
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundColor: "rgba(0, 48, 96,0.5)",
        }}
      ></div>
      <img
        src={imageUrl}
        alt="user"
        className={cn(
          "rounded-full object-cover  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 outline outline-gray-500",
          {
            "size-18": !local,
            "size-12": local,
          }
        )}
      />
    </div>
  );
}
