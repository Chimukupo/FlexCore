import * as React from "react"
import { cn } from "@/lib/utils"

const Form = React.forwardRef<
  HTMLFormElement,
  React.ComponentProps<"form">
>(({ className, ...props }, ref) => {
  return (
    <form
      className={cn("space-y-4", className)}
      ref={ref}
      {...props}
    />
  )
})
Form.displayName = "Form"

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("space-y-2", className)}
      ref={ref}
      {...props}
    />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label">
>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      ref={ref}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn("text-sm text-destructive", className)}
      ref={ref}
      {...props}
    />
  )
})
FormMessage.displayName = "FormMessage"

export { Form, FormItem, FormLabel, FormMessage } 