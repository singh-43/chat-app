import React from "react";

var Intent = "primary" | "secondary";
var Size = "sm" | "md" | "lg";

const colorMap = {
  primary: "bg-cyan-600 text-white",
  secondary: "bg-slate-800 text-slate-400",
};
const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};
const IconButton = ({ intent = "primary", size = "md", className, ...props }) => {
  const colorClass = colorMap[intent];
  const sizeClass = sizeMap[size];
  const classes = 
    "cursor-pointer";
  return <button className={classes} {...props} />;
}

export default IconButton;