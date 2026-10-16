# Controlled cat-art workflow research

## What is in use now

The current animation is a set of separately generated transparent pose images. Each candidate is inspected at the website's small rendered size, in sequence with its actual previous and next frames, then packed into the existing atlases. The page still uses its existing scroll-driven frame selection and geometry. OpenPose, IP-Adapter, and EbSynth have not been used to produce the current frames.

## Tool fit

- **ComfyUI** is a node-graph authoring and execution environment for image-generation workflows. Workflows can be saved as JSON, including settings and seeds, and it has an API. That makes it a reasonable controlled workbench for repeating the same pose-generation recipe and recording what produced each candidate. It is an orchestrator; consistency still depends on the model, reference conditioning, guides, and human review. A small pilot on a few troublesome poses is the right next step before moving the whole art pipeline there. [ComfyUI project](https://github.com/comfy-org/ComfyUI)
- **IP-Adapter** can condition generation on the approved cat reference, so it is useful for carrying color, face, and markings into new poses. It guides resemblance rather than locking identity: the project documents a scale tradeoff between prompt-image consistency and variety. In ComfyUI it requires a compatible checkpoint, adapter weights, and an appropriate node implementation. [IP-Adapter project](https://github.com/tencent-ailab/IP-Adapter)
- **Vanilla OpenPose ControlNet** is trained around human pose landmarks, so it is not a ready-made cat skeleton. A hand-authored quadruped pose guide, a compatible animal-pose control model, or a rough drawn pose is more appropriate here. AP-10K shows that animal keypoints can be modeled across many species, but the dataset itself is not a drop-in ControlNet pose preprocessor. [ControlNet human-pose example](https://github.com/lllyasviel/ControlNet/blob/main/README.md), [AP-10K](https://github.com/airhors/Animal-Pose-Estimation-i)
- **EbSynth** propagates a painted/stylized keyframe through an existing guide video. It could help once there is a continuous guide animation (for example a rough 2D/3D cat rig) whose movement already matches the sequence. It does not invent missing motion between still poses, so it is not a replacement for designing the bridging poses. [EbSynth](https://ebsynth.com/)

## Proposed repeatable checks

For every redo, inspect the immediate neighbors and make a new pose intended to bridge them. Compare silhouette and body/head scale, direction and body rotation, ear count, four visible limbs where appropriate, tail shape, landing contact, and facial expression. Check the sequence at the final website size, not only as a large image. Reject candidates that fail any of these checks and regenerate instead of patching anatomy by adding parts from an incompatible pose.

Only mark a pose green in the review sheet after the user approves both the image and its placement. A placement confirmation by itself is recorded as placement-only.
