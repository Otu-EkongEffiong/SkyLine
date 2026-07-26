declare module "@/components/ui/label" {
  import * as React from "react";

  export const Label: React.ForwardRefExoticComponent<
    React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>
  >;
}

declare module "@/components/ui/input" {
  import * as React from "react";

  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}

declare module "@/components/ui/button" {
  import * as React from "react";

  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
      size?: "default" | "sm" | "lg" | "icon";
      asChild?: boolean;
    } & React.RefAttributes<HTMLButtonElement>
  >;
}
