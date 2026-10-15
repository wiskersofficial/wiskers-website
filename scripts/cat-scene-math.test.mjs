import test from 'node:test';
import assert from 'node:assert/strict';
import {measureCatScroll, catWorldOffset} from '../src/cat-scene-math.js';

// Compact layouts must keep their falling room without artificial card padding.
const layouts = [
  {name:'517px split hero',tileFootDocumentY:567.45,landingScroll:833.36,viewportHeight:763},
  {name:'390px stacked hero',tileFootDocumentY:763,landingScroll:843,viewportHeight:844},
  {name:'desktop',tileFootDocumentY:615,landingScroll:748,viewportHeight:763},
  {name:'short viewport',tileFootDocumentY:580,landingScroll:748,viewportHeight:600},
];

for (const layout of layouts) {
  test(`${layout.name}: contact stays visible while the page keeps moving`,()=>{
    const motion = measureCatScroll(layout);
    const footY = layout.tileFootDocumentY - layout.landingScroll + catWorldOffset(layout.landingScroll,motion);
    assert.ok(Math.abs(footY - layout.viewportHeight*.52) < .001);
    for (let y=0;y<layout.landingScroll;y+=7) {
      const next=Math.min(y+7,layout.landingScroll);
      const contentStep=-(next-y)+catWorldOffset(next,motion)-catWorldOffset(y,motion);
      assert.ok(contentStep<0,'content must always move upward');
      assert.ok(contentStep>-(next-y),'content must move slower than native scroll');
    }
    const before=catWorldOffset(layout.landingScroll-.001,motion);
    const at=catWorldOffset(layout.landingScroll,motion);
    assert.ok(at-before<.001,'no offset jump at contact');
    assert.equal(catWorldOffset(layout.landingScroll+100,motion),at,'no reset after contact');
    assert.equal(catWorldOffset(0,motion),0,'reverse scrolling restores original layout');
    assert.equal(catWorldOffset(-50,motion),0,'overscroll cannot create a negative spacer');
  });
}

test('unusual layouts retain positive motion and a finite footer offset',()=>{
  for (const tileFootDocumentY of [100,2000]) {
    const motion=measureCatScroll({tileFootDocumentY,landingScroll:800,viewportHeight:800});
    assert.ok(motion.contentSpeed>=.12 && motion.contentSpeed<=.65);
    assert.ok(Number.isFinite(catWorldOffset(2000,motion)));
  }
});
