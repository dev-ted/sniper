import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval(
  "collect makro black friday",
  { hours: 6 },
  internal.collectors.makro.collect,
  {}
)

export default crons
