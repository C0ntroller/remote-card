import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  CSSResult,
  css,
  internalProperty,
} from 'lit-element';
import { HomeAssistant, applyThemesOnElement, hasAction, handleClick } from 'custom-card-helpers';

import { RokuCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

const defaultRemoteAction = {
  action: 'call-service',
  service: 'remote.send_command',
};

/* eslint no-console: 0 */
console.info(
  `%c  ROKU-CARD     \n%c  Version ${CARD_VERSION} `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('roku-card')
export class RokuCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @internalProperty() private _config?: RokuCardConfig;

  public getCardSize(): number {
    return 7;
  }

  public setConfig(config: RokuCardConfig): void {
    if (!config.entity && !config.remote) {
      console.log("Invalid configuration. If no entity provided, you'll need to provide a remote entity");
      return;
    }

    this._config = {
      theme: 'default',
      haptic: 'success',
      ...config,
    };
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (this._config.entity && !stateObj) {
      return html`
        <ha-card>
          <div class="warning">Entity Unavailable</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card .header="${this._config.name}">
        <div class="remote">
          <div class="row">
            <div class="app">${stateObj ? stateObj.attributes.app_name : ''}</div>
            ${this._config.tv || (this._config.power && this._config.power.show)
              ? this._renderButton('power', 'mdi:power', 'Power')
              : ''}
          </div>
          ${this._config.back?.show || this._config.info?.show || this._config.home?.show
            ? html`
                <div class="row">
                  ${this._renderButton('back', 'mdi:arrow-left', 'Back')}
                  ${this._renderButton('info', 'mdi:asterisk', 'Info')}
                  ${this._renderButton('home', 'mdi:home', 'Home')}
                </div>
              `
            : ''}
          ${(this._config.apps && this._config.apps.length > 0) || this._config.up?.show
            ? html`
                <div class="row">
                  ${this._renderImage(0)} ${this._renderButton('up', 'mdi:chevron-up', 'Up')} ${this._renderImage(1)}
                </div>
              `
            : ''}
          ${this._config.left?.show || this._config.select?.show || this._config.right?.show
            ? html`
                <div class="row">
                  ${this._renderButton('left', 'mdi:chevron-left', 'Left')}
                  ${this._renderButton('select', 'mdi:checkbox-blank-circle', 'Select')}
                  ${this._renderButton('right', 'mdi:chevron-right', 'Right')}
                </div>
              `
            : ''}
          ${(this._config.apps && this._config.apps.length > 2) || this._config.down?.show
            ? html`
                <div class="row">
                  ${this._renderImage(2)} ${this._renderButton('down', 'mdi:chevron-down', 'Down')}
                  ${this._renderImage(3)}
                </div>
              `
            : ''}
          ${this._config.reverse?.show || this._config.play?.show || this._config.forward?.show
            ? html`
                <div class="row">
                  ${this._renderButton('reverse', 'mdi:rewind', 'Rewind')}
                  ${this._renderButton('play', 'mdi:play-pause', 'Play/Pause')}
                  ${this._renderButton('forward', 'mdi:fast-forward', 'Fast-Forward')}
                </div>
              `
            : ''}
          ${this._config.tv ||
          this._config.volume_mute?.show ||
          this._config.volume_down?.show ||
          this._config.volume_up?.show
            ? html`
                <div class="row">
                  ${this._renderButton('volume_mute', 'mdi:volume-mute', 'Volume Mute')}
                  ${this._renderButton('volume_down', 'mdi:volume-minus', 'Volume Down')}
                  ${this._renderButton('volume_up', 'mdi:volume-plus', 'Volume Up')}
                </div>
              `
            : ''}
          ${this._config.extra_buttons && this._config.extra_buttons.length > 0
            ? html`
                <div class="row">
                  ${this._renderExtraButton(0)}${this._renderExtraButton(1)}${this._renderExtraButton(2)}
                </div>
              `
            : ''}
        </div>
      </ha-card>
    `;
  }

  protected updated(changedProps): void {
    if (!this._config) {
      return;
    }

    if (this.hass) {
      const oldHass = changedProps.get('hass');
      if (!oldHass || oldHass.themes !== this.hass.themes) {
        applyThemesOnElement(this, this.hass.themes, this._config.theme);
      }
    }
  }

  static get styles(): CSSResult {
    return css`
      .remote {
        padding: 16px 0 16px 0;
      }
      img,
      ha-icon-button {
        cursor: pointer;
      }
      ha-icon-button {
        --mdc-icon-button-size: 64px;
        --mdc-icon-size: 48px;
      }
      img {
        width: 64px;
        height: 64px;
        border-radius: 25px;
      }
      .row {
        display: flex;
        padding: 8px 36px 8px 36px;
        justify-content: space-evenly;
        align-items: center;
      }
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      .app {
        flex-grow: 3;
        font-size: 20px;
      }
    `;
  }

  private _renderImage(index: number): TemplateResult {
    return this._config && this._config.apps && this._config.apps.length > index
      ? this._config.apps[index].icon
        ? html`
            <ha-icon-button
              .app=${this._config.apps[index].app}
              .icon=${this._config.apps[index].icon}
              .title=${this._config.apps[index].app}
              .config=${this._config.apps[index]}
              @action=${this._handleAction}
              .actionHandler=${actionHandler({
                hasHold: hasAction(this._config.apps[index].hold_action),
                hasDoubleClick: hasAction(this._config.apps[index].double_tap_action),
              })}
            ></ha-icon-button>
          `
        : html`
            <img
              src=${this._config.apps[index].image || ''}
              .app=${this._config.apps[index].app}
              .config=${this._config.apps[index]}
              @action=${this._handleAction}
              .actionHandler=${actionHandler({
                hasHold: hasAction(this._config.apps[index].hold_action),
                hasDoubleClick: hasAction(this._config.apps[index].double_tap_action),
              })}
            />
          `
      : html`
          <ha-icon-button></ha-icon-button>
        `;
  }

  private _renderButton(button: string, icon: string, title: string): TemplateResult {
    if (this._config) {
      const config = this._config[button];
      return config && config.show === true
        ? html`
            <ha-icon-button
              .button=${button}
              icon=${config.icon ? config.icon : icon}
              title=${title}
              @action=${this._handleAction}
              .actionHandler=${actionHandler({
                hasHold: config && hasAction(config.hold_action),
                hasDoubleClick: config && hasAction(config.double_tap_action),
              })}
            ></ha-icon-button>
          `
        : html`
            <ha-icon-button></ha-icon-button>
          `;
    } else {
      return html``;
    }
  }

  private _renderExtraButton(index: number): TemplateResult {
    if (!this._config) return html``;
    if (!this._config.extra_buttons || this._config.extra_buttons.length - 1 < index)
      return html`
        <ha-icon-button></ha-icon-button>
      `;

    const config = this._config.extra_buttons[index];
    return config && config.show
      ? html`
          <ha-icon-button
            .button=${config.title}
            icon=${config.icon}
            title=${config.title}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: config && hasAction(config.hold_action),
              hasDoubleClick: config && hasAction(config.double_tap_action),
            })}
          ></ha-icon-button>
        `
      : html`
          <ha-icon-button></ha-icon-button>
        `;
  }

  private _handleAction(ev): void {
    if (this.hass && this._config && ev.detail.action) {
      const button = ev.currentTarget.button;
      const config = this._config[button] || ev.currentTarget.config;
      const app = ev.currentTarget.app;
      const remote = this._config.remote ? this._config.remote : 'remote.' + this._config.entity.split('.')[1];

      handleClick(
        this,
        this.hass,
        app
          ? {
              tap_action: {
                haptic: this._config.haptic,
                action: 'call-service',
                service: 'media_player.select_source',
                service_data: {
                  entity_id: this._config.entity,
                  source: app,
                },
              },
              ...config,
            }
          : {
              tap_action: {
                haptic: this._config.haptic,
                service_data: {
                  command: button,
                  entity_id: remote,
                },
                ...defaultRemoteAction,
              },
              ...config,
            },
        ev.detail.action === 'hold',
        ev.detail.action === 'double_tap',
      );
    }
  }
}
