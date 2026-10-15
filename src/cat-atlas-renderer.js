// Atlas loading and frame selection are kept separate from scroll choreography
// so their synchronization contract can be regression-tested in isolation.
export async function prepareAtlasScene(entries, loadAtlas, createLayer) {
  const loaded = await Promise.all(entries.map(async ([name,path])=>[
    name,
    await loadAtlas(name,path),
  ]));
  const atlases = Object.fromEntries(loaded);
  await Promise.all(Object.entries(atlases).map(([name,atlas])=>createLayer(name,atlas)));
  return atlases;
}

export function applyAtlasFrame(atlases, name, pose, stableId, cat, state) {
  const atlas = atlases[name];
  if (!atlas || !cat) return false;
  pose = Math.max(0,Math.min(atlas.cellRects.length-1,pose));
  const [x,y,width,height] = atlas.cellRects[pose];
  // Geometry is complete on the target layer before its visibility changes.
  atlas.clip.setAttribute('x',x);
  atlas.clip.setAttribute('y',y);
  atlas.clip.setAttribute('width',width);
  atlas.clip.setAttribute('height',height);
  atlas.layer.setAttribute('viewBox',atlas.viewBoxes[pose].join(' '));
  const poseChanged = state.currentPoseId !== stableId;
  if (poseChanged) {
    for (const [layerName,entry] of Object.entries(atlases)) {
      entry.layer.classList.toggle('is-active',layerName === name);
    }
    state.currentPoseId = stableId;
  }
  cat.dataset.pose = stableId;
  cat.dataset.atlas = name;
  cat.dataset.poseIndex = String(pose);
  return poseChanged;
}
