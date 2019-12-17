import {
  LitElement,
  html,
  customElement,
  property,
  TemplateResult
} from 'lit-element';
import { CSSPropertyInfo } from './lib/types.js';

const renderCssProps = (props: CSSPropertyInfo[]): TemplateResult => {
  const rows = props.map(prop => {
    const { name, value } = prop;
    const id = `prop-${name}`;
    return html`
      <tr>
        <td><label for="${id}" part="knob-label">${name}</label></td>
        <td>
          <input
            id="${id}"
            type="text"
            .value="${String(value)}"
            data-name="${name}"
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

@customElement('api-viewer-demo-css')
export class ApiViewerDemoCss extends LitElement {
  @property({ attribute: false, hasChanged: () => true })
  cssProps: CSSPropertyInfo[] = [];

  protected createRenderRoot() {
    return this;
  }

  protected render() {
    return html`
      <section part="knobs-column" @change="${this._onChange}">
        <h3 part="knobs-header">Custom CSS Properties</h3>
        ${renderCssProps(this.cssProps)}
      </section>
    `;
  }

  protected _onChange(e: Event) {
    const target = e.composedPath()[0];
    if (target && target instanceof HTMLInputElement) {
      this.dispatchEvent(
        new CustomEvent('css-changed', {
          detail: {
            name: target.dataset.name,
            value: target.value
          }
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'api-viewer-demo-css': ApiViewerDemoCss;
  }
}
