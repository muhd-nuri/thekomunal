// Komunal: blob blocks — the organic blue shape from the cup pattern, in 0..1 objectBoundingBox space.
// Blob shapes approved by the client (2026-09-16) — drawn after the cup-pattern lobes.
//
// Every path is a closed cubic-bezier outline normalised so the *sampled curve* spans exactly
// 0..1 on both axes; each fills ~85-86% of its box, so photos stay generous inside the mask.
// Command structure (M + 8 C + Z) is identical across all of them, which is what makes
// `blobMorphPaths` interpolatable by framer-motion's complex-string mixing.

export type BlobVariant = 1 | 2 | 3

export const blobPaths: Record<BlobVariant, string> = {
  1: "M 0.9998 0.4948 C 1.0028 0.6399 0.9773 0.8569 0.8917 0.94 C 0.806 1.0231 0.618 0.9968 0.4857 0.9934 C 0.3535 0.99 0.1788 1.0029 0.0982 0.9198 C 0.0176 0.8367 -0.0083 0.6249 0.0022 0.4948 C 0.0128 0.3648 0.0811 0.2208 0.1617 0.1395 C 0.2423 0.0582 0.367 0.0189 0.4857 0.0072 C 0.6044 -0.0045 0.7881 -0.012 0.8737 0.0693 C 0.9594 0.1506 0.9968 0.3497 0.9998 0.4948 Z",
  2: "M 0.9998 0.5223 C 1.003 0.648 0.966 0.8299 0.8849 0.9095 C 0.8039 0.9891 0.6375 0.9999 0.5136 1 C 0.3897 1.0001 0.2259 0.9897 0.1417 0.9101 C 0.0576 0.8305 0.0208 0.6642 0.0086 0.5223 C -0.0036 0.3803 -0.0156 0.1424 0.0686 0.0582 C 0.1528 -0.0259 0.3807 0.0012 0.5136 0.0174 C 0.6465 0.0335 0.7848 0.0708 0.8658 0.1549 C 0.9469 0.2391 0.9966 0.3965 0.9998 0.5223 Z",
  3: "M 1 0.5475 C 0.9993 0.6741 0.9786 0.8504 0.891 0.9257 C 0.8033 1.0009 0.6092 1.0025 0.4741 0.999 C 0.339 0.9955 0.1577 0.9801 0.0803 0.9048 C 0.0029 0.8295 0.0145 0.6708 0.0098 0.5475 C 0.0051 0.4241 -0.0253 0.2558 0.0521 0.1646 C 0.1295 0.0733 0.3337 -0.0002 0.4741 0 C 0.6146 0.0002 0.8072 0.0745 0.8948 0.1658 C 0.9825 0.257 1.0006 0.4208 1 0.5475 Z",
}

/** Hero-only slow morph: two compatible states of blob 1 (same commands, same order). */
export const blobMorphPaths: [string, string] = [
  blobPaths[1],
  "M 0.9996 0.5088 C 1.005 0.6523 0.9591 0.8796 0.8707 0.9574 C 0.7822 1.0352 0.5949 0.9844 0.4689 0.9756 C 0.3428 0.9668 0.1924 0.9825 0.1143 0.9047 C 0.0361 0.8269 0.0011 0.642 0 0.5088 C -0.001 0.3757 0.0297 0.1906 0.1078 0.1058 C 0.186 0.021 0.3471 0.0017 0.4689 0.0001 C 0.5906 -0.0015 0.7499 0.0116 0.8383 0.0964 C 0.9268 0.1811 0.9942 0.3653 0.9996 0.5088 Z",
]
