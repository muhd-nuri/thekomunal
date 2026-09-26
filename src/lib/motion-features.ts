// Komunal: framer-motion's animation features, split out so LazyMotion can load them
// after hydration instead of shipping the full `motion` bundle up front.
import { domAnimation } from "framer-motion"

export default domAnimation
