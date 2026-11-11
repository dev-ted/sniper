"use client"

import { Component, type ReactNode } from "react"

export class DealError extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="text-sm text-muted-foreground">
          Deals could not be loaded. Try again in a moment.
        </p>
      )
    }
    return this.props.children
  }
}
