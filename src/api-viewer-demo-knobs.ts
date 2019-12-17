import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult
} from 'lit-element';
import { PropertyInfo, SlotValue } from './lib/types.js';
import { getSlotTitle, hasSlotTemplate, normalizeType } from './lib/utils.js';

const getInputType = (type: string) => {
  switch (normalizeType(type)) {
    case 'boolean':
      return 'checkbox';
    case 'number':
      return 'number';
    default:
      return 'text';
  }
};

const getInput = (name: string, type: string, value: unknown, id: string) => {
  const inputType = getInputType(type);
  let input;
  if (value === undefined) {
    input = html`
      <input
        id="${id}"
        type="${inputType}"
        data-name="${name}"
        data-type="${type}"
      />
    `;
  } else if (normalizeType(type) === 'boolean') {
    input = html`
      <input
        id="${id}"
        type="checkbox"
        .checked="${Boolean(value)}"
        data-name="${name}"
        data-type="${type}"
        part="checkbox"
      />
    `;
  } else {
    input = html`
      <input
        id="${id}"
        type="${inputType}"
        .value="${String(value)}"
        data-name="${name}"
        data-type="${type}"
        part="input"
      />
    `;
  }
  return input;
};

const renderPropKnobs = (props: PropertyInfo[]): TemplateResult => {
  const rows = props.map(prop => {
    const { name, type, value } = prop;
    const id = `prop-${name}`;
    return html`
      <tr>
        <td><label for="${id}" part="knob-label">${name}</label></td>
        <td>${getInput(name, type, value, id)}</td>
      </tr>
    `;
  });

  return html`
    <table>
      ${rows}
    </table>
  `;
};

const renderSlotKnobs = (slots: SlotValue[]): TemplateResult => {
  const rows = slots.map(slot => {
    const { name, content } = slot;
    const id = `slot-${name || 'default'}`;
    return html`
      <tr>
        <td>
          <label for="${id}" part="knob-label">
            ${getSlotTitle(name)}
          </label>
        </td>
        <td>
          <input
            id="${id}"
            type="text"
            .value="${content}"
            data-type="slot"
            data-slot="${name}"
            part="input"
          />
        </td>
      </tr>
    `;
  });

  return html`
    <table>
      ${rows}
    </table>
  `;
};

@customElement('api-viewer-demo-knobs')
export class ApiViewerDemoKnobs extends LitElement {
  @property({ type: String }) tag = '';

  @property({ attribute: false, hasChanged: () => true })
  props: PropertyInfo[] = [];

  @property({ attribute: false, hasChanged: () => true })
  slots: SlotValue[] = [];

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    return html`
      <div class="columns" @change="${this._onChange}">
        <section part="knobs-column">
          <h3 part="knobs-header">Properties</h3>
          ${renderPropKnobs(this.props)}
        </section>
        <section
          ?hidden="${hasSlotTemplate(this.tag) || this.slots.length === 0}"
          part="knobs-column"
        >
          <h3 part="knobs-header">Slots</h3>
          ${renderSlotKnobs(this.slots)}
        </section>
      </div>
    `;
  }

  protected _onChange(e: Event) {
    const target = e.composedPath()[0];
    if (target && target instanceof HTMLInputElement) {
      const { type } = target.dataset;
      if (type === 'slot') {
        this.dispatchEvent(
          new CustomEvent('slot-changed', {
            detail: {
              name: target.dataset.slot,
              content: target.value
            }
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent('prop-changed', {
            detail: {
              name: target.dataset.name,
              type,
              value:
                normalizeType(type as string) === 'boolean'
                  ? target.checked
                  : target.value
            }
          })
        );
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'api-viewer-demo-knobs': ApiViewerDemoKnobs;
  }
}
