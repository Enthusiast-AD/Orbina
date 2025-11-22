import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-primary",
    textColor = "text-primary-foreground",
    className = "",
    ...props
}) {
    return (
        <button className={`px-4 py-2 ${bgColor} ${textColor} ${className} hover:opacity-90 transition-opacity cursor-pointer`} {...props}>
            {children}
        </button>
    );
}