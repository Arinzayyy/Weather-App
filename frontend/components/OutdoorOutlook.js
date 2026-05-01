// Outdoor outlook badge.
// Serves user story US-19: Marcus (event planner) wants a defensible
// recommendation about whether the current conditions support an outdoor
// event, without doing his own analysis on raw numbers.
//
// The interpretation is deterministic — same inputs always yield the same
// label and reasoning. Hard rules first (severe weather → indoor), then
// caution flags accumulate into "outdoor with a backup," and the absence of
// any flag is the green light.

function buildOutlook({ weatherId, tempF, windMph, humidity, description }) {
  const desc = (description || '').toLowerCase();

  // ── Hard "indoor recommended" gates ──
  if (weatherId >= 200 && weatherId < 300) {
    return { label: 'Indoor recommended', reasons: ['Thunderstorm activity'], tone: 'red' };
  }
  if (weatherId >= 502 && weatherId < 600) {
    return { label: 'Indoor recommended', reasons: ['Moderate to heavy rain'], tone: 'red' };
  }
  if (weatherId >= 600 && weatherId < 700) {
    return { label: 'Indoor recommended', reasons: ['Snowfall'], tone: 'red' };
  }
  if (weatherId >= 711 && weatherId < 800) {
    return { label: 'Indoor recommended', reasons: ['Reduced visibility (' + (desc || 'atmospheric') + ')'], tone: 'red' };
  }
  if (typeof windMph === 'number' && windMph > 25) {
    return { label: 'Indoor recommended', reasons: ['High wind ' + Math.round(windMph) + ' mph'], tone: 'red' };
  }
  if (typeof tempF === 'number' && (tempF < 35 || tempF > 95)) {
    return {
      label: 'Indoor recommended',
      reasons: ['Temperature ' + Math.round(tempF) + '°F outside the comfortable outdoor band'],
      tone: 'red',
    };
  }

  // ── Cautions accumulate into "outdoor with a backup" ──
  const reasons = [];
  if (weatherId === 500 || (weatherId >= 300 && weatherId < 400)) {
    reasons.push('Light precipitation');
  }
  if (weatherId === 701) {
    reasons.push('Mist');
  }
  if (typeof windMph === 'number' && windMph > 15) {
    reasons.push('Breezy (' + Math.round(windMph) + ' mph)');
  }
  if (typeof tempF === 'number' && (tempF < 50 || tempF > 88)) {
    reasons.push((tempF < 50 ? 'Cool' : 'Warm') + ' (' + Math.round(tempF) + '°F)');
  }
  if (typeof humidity === 'number' && humidity > 85) {
    reasons.push('Humid (' + humidity + '%)');
  }

  if (reasons.length > 0) {
    return { label: 'Outdoor with a backup', reasons, tone: 'amber' };
  }

  return {
    label: 'Great for outdoor events',
    reasons: ['Mild conditions, no precipitation, comfortable wind'],
    tone: 'green',
  };
}

const TONE_STYLES = {
  green: {
    chip:  'bg-emerald-500/25 border-emerald-300/40 text-emerald-100',
    dot:   'bg-emerald-300',
  },
  amber: {
    chip:  'bg-amber-400/25 border-amber-300/40 text-amber-100',
    dot:   'bg-amber-300',
  },
  red: {
    chip:  'bg-red-500/25 border-red-300/40 text-red-100',
    dot:   'bg-red-300',
  },
};

export default function OutdoorOutlook({ weatherId, tempF, windMph, humidity, description }) {
  if (typeof weatherId !== 'number') return null;
  const outlook = buildOutlook({ weatherId, tempF, windMph, humidity, description });
  const tone = TONE_STYLES[outlook.tone] || TONE_STYLES.amber;
  const tooltip = outlook.reasons.join(' · ');

  return (
    <div
      className={
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ' +
        tone.chip
      }
      title={tooltip}
      aria-label={'Outdoor outlook: ' + outlook.label + '. ' + tooltip}
    >
      <span className={'w-1.5 h-1.5 rounded-full ' + tone.dot} aria-hidden="true" />
      <span>{outlook.label}</span>
      <span className="hidden sm:inline text-white/50 font-normal">· {tooltip}</span>
    </div>
  );
}

// Exported for unit-testing or reuse in the forecast row later.
export { buildOutlook };
