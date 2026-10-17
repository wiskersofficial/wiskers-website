const art = {
  calculate: `<svg viewBox="0 0 520 300" role="presentation" focusable="false">
    <path class="ca-rule" d="M40 38H480M40 262H480M40 84H480M40 130H480M40 176H480M40 222H480"/><text class="ca-kicker" x="40" y="26">YOUR INPUTS</text><text class="ca-kicker" x="376" y="26">SEE THE MATH</text>
    <rect class="ca-input" x="40" y="59" width="124" height="52"/><text class="ca-label" x="54" y="80">TEAM SIZE</text><text class="ca-value" x="54" y="100">12 people</text>
    <rect class="ca-input ca-input--green" x="40" y="124" width="124" height="52"/><text class="ca-label" x="54" y="145">HOURS / WEEK</text><text class="ca-value" x="54" y="165">8.5 hours</text>
    <rect class="ca-input ca-input--coral" x="40" y="189" width="124" height="52"/><text class="ca-label" x="54" y="210">COST / HOUR</text><text class="ca-value" x="54" y="230">£34</text>
    <path class="ca-flow" d="M164 85H210L229 105M164 150H229M164 215H210L229 195M229 105V195"/><rect class="ca-formula" x="229" y="113" width="108" height="74"/><text class="ca-kicker" x="246" y="135">FORMULA</text><text class="ca-value" x="247" y="160">× ×</text><path class="ca-flow" d="M337 150H376"/><path class="ca-arrow" d="m369 143 8 7-8 7"/>
    <rect class="ca-result" x="383" y="86" width="97" height="128"/><text class="ca-label" x="396" y="111">INPUTS</text><path class="ca-accent" d="M396 128h58"/><text class="ca-label" x="396" y="157">VARIABLES</text><path class="ca-accent" d="M396 174h43"/><text class="ca-label" x="396" y="198">RESULT</text>
    <path class="ca-tick" d="M343 54v12m-6-6h12M352 222v12m-6-6h12"/>
  </svg>`,
  diagnose: `<svg viewBox="0 0 520 300" role="presentation" focusable="false">
    <path class="ca-rule" d="M40 38H480M40 262H480"/><text class="ca-kicker" x="40" y="26">FOLLOW THE SIGNAL</text><text class="ca-kicker" x="388" y="26">NEXT STEP</text>
    <rect class="ca-question" x="40" y="109" width="132" height="78"/><text class="ca-label" x="56" y="135">START HERE</text><text class="ca-value" x="56" y="160">Where does</text><text class="ca-value" x="56" y="178">time go?</text>
    <path class="ca-branch" d="M172 148H215V81H252M215 148H252M215 148V216H252"/><circle class="ca-node" cx="215" cy="148" r="6"/>
    <rect class="ca-choice" x="252" y="54" width="127" height="53"/><text class="ca-label" x="267" y="76">REPEATED</text><text class="ca-value" x="267" y="96">manual work</text>
    <rect class="ca-choice ca-choice--green" x="252" y="122" width="127" height="53"/><text class="ca-label" x="267" y="144">WAITING</text><text class="ca-value" x="267" y="164">for approval</text>
    <rect class="ca-choice ca-choice--coral" x="252" y="190" width="127" height="53"/><text class="ca-label" x="267" y="212">UNCLEAR</text><text class="ca-value" x="267" y="232">ownership</text>
    <path class="ca-flow" d="M379 80H409V130M379 148H409M379 216H409V166M409 130V166H430"/><path class="ca-arrow" d="m423 159 8 7-8 7"/>
    <rect class="ca-result" x="432" y="116" width="48" height="64"/><path class="ca-accent" d="M443 139h25M443 149h18M443 159h21"/>
    <circle class="ca-dot" cx="54" cy="218" r="3"/><circle class="ca-dot" cx="68" cy="218" r="3"/><circle class="ca-dot" cx="82" cy="218" r="3"/>
  </svg>`,
  compare: `<svg viewBox="0 0 520 300" role="presentation" focusable="false">
    <path class="ca-rule" d="M40 38H480M40 262H480"/><text class="ca-kicker" x="40" y="26">SAME JOB, TWO ROUTES</text>
    <text class="ca-label" x="116" y="64">OPTION A</text><text class="ca-label" x="346" y="64">OPTION B</text>
    <path class="ca-beam" d="M113 106 76 214H150Z"/><path class="ca-beam ca-beam--green" d="M365 106 328 214H402Z"/><path class="ca-pivot" d="M113 106 76 214H150ZM365 106 328 214H402Z"/>
    <path class="ca-pan" d="M66 117H160M318 117H412"/><path class="ca-cord" d="M76 117v28m84-28v28m158-28v28m84-28v28"/>
    <rect class="ca-weight" x="83" y="146" width="70" height="44"/><text class="ca-value" x="98" y="174">££</text><rect class="ca-weight ca-weight--green" x="325" y="146" width="70" height="44"/><text class="ca-value" x="344" y="174">£</text>
    <path class="ca-base" d="M89 222H137M341 222H389"/><rect class="ca-tag" x="52" y="231" width="116" height="24"/><text class="ca-small" x="65" y="247">MORE SETUP</text><rect class="ca-tag ca-tag--green" x="304" y="231" width="116" height="24"/><text class="ca-small" x="319" y="247">MORE FLEXIBLE</text>
    <path class="ca-midline" d="M260 76V245"/><rect class="ca-diamond" x="251" y="144" width="18" height="18" transform="rotate(45 260 153)"/><text class="ca-kicker" x="230" y="282">YOUR CRITERIA</text>
  </svg>`,
  learn: `<svg viewBox="0 0 520 300" role="presentation" focusable="false">
    <path class="ca-rule" d="M40 38H480M40 262H480"/><text class="ca-kicker" x="40" y="26">A TOOL IN THE WILD</text>
    <rect class="ca-loop-card" x="55" y="76" width="144" height="77"/><text class="ca-label" x="72" y="101">LAUNCH</text><text class="ca-value" x="72" y="127">Useful first test</text><path class="ca-accent" d="M72 139h86"/>
    <rect class="ca-loop-card ca-loop-card--green" x="322" y="76" width="144" height="77"/><text class="ca-label" x="339" y="101">OBSERVE</text><text class="ca-value" x="339" y="127">What gets used</text><path class="ca-accent ca-accent--green" d="M339 139h86"/>
    <rect class="ca-loop-card ca-loop-card--coral" x="190" y="190" width="144" height="53"/><text class="ca-label" x="207" y="213">IMPROVE</text><text class="ca-value" x="207" y="234">The next version</text>
    <path class="ca-flow" d="M199 113H274L307 113M394 153V172L339 199M190 216H151V172L115 153"/><path class="ca-arrow" d="m266 106 8 7-8 7m31-7 7-7 7 7-7 7m-69 96-8 7 8 7m-90-62-7-7 7-7"/>
    <circle class="ca-feedback" cx="274" cy="113" r="7"/><circle class="ca-feedback ca-feedback--green" cx="339" cy="172" r="7"/><circle class="ca-feedback ca-feedback--coral" cx="151" cy="172" r="7"/>
    <path class="ca-spark" d="M252 65v14m-7-7h14M452 193v12m-6-6h12"/>
  </svg>`
};

const capabilityNames = ['calculate', 'diagnose', 'compare', 'learn'];

function capabilityFor(panel, index) {
  const named = panel.dataset.capability || panel.dataset.v5Capability || '';
  const heading = panel.querySelector('h2, h3, h4')?.textContent || '';
  const label = `${named} ${heading}`.toLowerCase();
  return capabilityNames.find((name) => label.includes(name)) || capabilityNames[index];
}

export function mountCapabilityArt(root = document) {
  const panels = [
    ...(root.matches?.('.v5-capability') ? [root] : []),
    ...root.querySelectorAll('.v5-capability')
  ];
  panels.forEach((panel, index) => {
    if (panel.querySelector(':scope > .v5-capability-art')) return;
    const name = capabilityFor(panel, index);
    if (!art[name]) return;
    const mount = document.createElement('div');
    mount.className = `v5-capability-art v5-capability-art--${name}`;
    mount.setAttribute('aria-hidden', 'true');
    mount.innerHTML = art[name];
    panel.append(mount);
  });
}
