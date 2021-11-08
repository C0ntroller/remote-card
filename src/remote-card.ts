import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  CSSResult,
  css,
  internalProperty,
} from 'lit-element/lit-element';
import { HomeAssistant, applyThemesOnElement, hasAction, handleClick } from 'custom-card-helpers';

import { RemoteCardConfig, RemoteButton, ActionRemoteButton } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

/* eslint no-console: 0 */
console.info(
  `%c  Remote-Card     \n%c  Version ${CARD_VERSION} `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

@customElement('remote-card')
export class RemoteCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @internalProperty() private _config?: RemoteCardConfig;

  public getCardSize(): number {
    if (this._config && this._config.buttons.length > 0) {
      const lengths = this._config.buttons.map(row => row.row.length);
      return Math.max(...lengths);
    } else {
      return 3;
    }
  }

  public setConfig(config: RemoteCardConfig): void {
    if (!config.entity || config.entity.split('.')[0] !== 'remote') {
      console.log("Invalid configuration. You'll need to provide a remote entity");
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

    const buttons = this._config.buttons.map(row => {
      const button_row = row.row.map(button => {
        return this._renderButton(button);
      });
      return html`
        <div class="row">
          ${button_row}
        </div>
      `;
    });

    return html`
      <ha-card .header="${this._config.title}">
        <div class="remote">
          ${buttons}
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
      ha-icon {
        cursor: pointer;
      }
      ha-icon {
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

  private _renderButton(button: RemoteButton): TemplateResult {
    if ('empty' in button && button.empty) {
      return html`
        <ha-icon icon="mdi:none"></ha-icon>
      `;
    }
    button = button as ActionRemoteButton;
    const actionConfig = {
      remote_command: button.remote_command,
      ...button.actions,
    };
    if (button.image && !button.icon) {
      return html`
        <img
          title=${button.title || ''}
          alt=${button.title || ''}
          src=${button.image || ''}
          .action_config=${actionConfig}
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(button.actions?.hold_action),
            hasDoubleClick: hasAction(button.actions?.double_tap_action),
          })}
        />
      `;
    }
    return html`
      <ha-icon-button
        .button=${button}
        title=${button.title || ''}
        .action_config=${actionConfig}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(button.actions?.hold_action),
          hasDoubleClick: hasAction(button.actions?.double_tap_action),
        })}
      >
        <ha-icon .icon=${button.icon || 'mdi:radiobox-marked'}></ha-icon>
      </ha-icon-button>
    `;
  }

  private _handleAction(ev): void {
    //const target = ev.currentTarget || ev.path[0];
    if (this.hass && this._config && ev.detail.action) {
      const actionConfig = ev.currentTarget.action_config;

      handleClick(
        this,
        this.hass,
        {
          tap_action: {
            haptic: this._config.haptic,
            action: 'call-service',
            service: 'remote.send_command',
            service_data: {
              entity_id: this._config.entity,
              device: this._config.device,
              command: actionConfig.remote_command,
            },
          },
          ...actionConfig,
        },
        ev.detail.action === 'hold',
        ev.detail.action === 'double_tap',
      );
    }
  }
}
