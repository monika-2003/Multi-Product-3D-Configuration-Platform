/**
 * Live-edits the active product's draft (color / scale / camera).
 * Feature flags decide which fields are shown, so the same form works
 * for every product without if/else on product ids.
 */
export default function ConfigEditor({ draft, featureFlags, onChange, onReset }) {
  const flags = featureFlags || {};
  const [x, y, z] = draft.camera.position;

  function updateCameraPosition(index, value) {
    const next = [...draft.camera.position];
    next[index] = value;
    onChange({ camera: { position: next } });
  }

  return (
    <form className="editor" onSubmit={(event) => event.preventDefault()}>
      <p className="panel-label">Config editor</p>

      {flags.allowColor && (
        <>
          <label className="field">
            Color
            <input
              aria-label="Product color"
              type="color"
              value={draft.color}
              onChange={(event) => onChange({ color: event.target.value })}
            />
          </label>
          <label className="field">
            Hex code
            <input
              aria-label="Product color hex"
              type="text"
              value={draft.color}
              maxLength={7}
              placeholder="#rrggbb"
              onChange={(event) => {
                const value = event.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                  onChange({ color: value });
                }
              }}
            />
          </label>
        </>
      )}

      {flags.allowScale && (
        <label className="field">
          Scale
          <div className="field-row">
            <input
              aria-label="Product scale slider"
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={draft.scale}
              onChange={(event) => onChange({ scale: Number(event.target.value) })}
            />
            <input
              aria-label="Product scale"
              type="number"
              min="0.1"
              max="3"
              step="0.1"
              value={draft.scale}
              onChange={(event) => onChange({ scale: Number(event.target.value) })}
            />
          </div>
        </label>
      )}

      {flags.allowCamera && (
        <>
          <label className="field">
            Camera FOV
            <input
              aria-label="Camera FOV"
              type="number"
              min="20"
              max="90"
              step="1"
              value={draft.camera.fov}
              onChange={(event) => onChange({ camera: { fov: Number(event.target.value) } })}
            />
          </label>
          <label className="field">
            Camera Z
            <input
              aria-label="Camera Z"
              type="number"
              step="0.1"
              value={z}
              onChange={(event) => updateCameraPosition(2, Number(event.target.value))}
            />
          </label>
          <div className="field-row camera-xy">
            <label className="field">
              Camera X
              <input
                aria-label="Camera X"
                type="number"
                step="0.1"
                value={x}
                onChange={(event) => updateCameraPosition(0, Number(event.target.value))}
              />
            </label>
            <label className="field">
              Camera Y
              <input
                aria-label="Camera Y"
                type="number"
                step="0.1"
                value={y}
                onChange={(event) => updateCameraPosition(1, Number(event.target.value))}
              />
            </label>
          </div>
        </>
      )}

      <button type="button" className="reset-btn" onClick={onReset}>
        Reset to defaults
      </button>
    </form>
  );
}
