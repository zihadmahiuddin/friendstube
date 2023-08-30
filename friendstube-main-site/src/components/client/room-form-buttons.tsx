"use client";

import { ButtonHTMLAttributes } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

import Button from "./button";

export function CreateRoomButton({
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} {...rest}>
      {pending ? "Creating..." : "Create Room"}
    </Button>
  );
}

export function DeleteRoomButton({
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} {...rest}>
      {pending ? "Deleting..." : "Delete Room"}
    </Button>
  );
}
