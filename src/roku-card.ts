import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  CSSResult,
  css
} from "lit-element";
import {
  HomeAssistant,
  applyThemesOnElement,
  hasAction,
  handleAction
} from "custom-card-helpers";

import { RokuCardConfig } from "./types";
import { actionHandler } from "./action-handler-directive";

const defaultRemoteAction = {
  action: "call-service",
  service: "remote.send_command"
};

@customElement("roku-card")
class RokuCard extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: RokuCardConfig;

  public getCardSize() {
    return 7;
  }

  public setConfig(config: RokuCardConfig): void {
    if (!config.entity) {
      console.log("Invalid configuration");
      return;
    }

    this._config = {
      theme: "default",
      ...config
    };
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass!.states[this._config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="warning">Show Warning</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card .header="${this._config.name}">
        <div class="remote">
          <div class="row">
            <div class="app">${stateObj.attributes.app_name}</div>
            ${this._config.tv || (this._config.power && this._config.power.show)
              ? this._renderButton("power", "mdi:power", "Power")
              : ""}
          </div>
          <div class="row">
            ${this._renderButton("back", "mdi:arrow-left", "Back")}
            ${this._renderButton("info", "mdi:asterisk", "Info")}
            ${this._renderButton("home", "mdi:home", "Home")}
          </div>

          <div class="row">
            ${this._renderImage(0)}
            ${this._renderButton("up", "mdi:chevron-up", "Up")}
            ${this._renderImage(1)}
          </div>

          <div class="row">
            ${this._renderButton("left", "mdi:chevron-left", "Left")}
            ${this._renderButton(
              "select",
              "mdi:checkbox-blank-circle",
              "Select"
            )}
            ${this._renderButton("right", "mdi:chevron-right", "Right")}
          </div>

          <div class="row">
            ${this._renderImage(2)}
            ${this._renderButton("down", "mdi:chevron-down", "Down")}
            ${this._renderImage(3)}
          </div>

          <div class="row">
            ${this._renderButton("reverse", "mdi:rewind", "Rewind")}
            ${this._renderButton("play", "mdi:play-pause", "Play/Pause")}
            ${this._renderButton("forward", "mdi:fast-forward", "Fast-Forward")}
          </div>

          ${this._config.tv ||
          (this._config.volume_mute && this._config.volume_mute.show) ||
          (this._config.volume_down && this._config.volume_down.show) ||
          (this._config.volume_up && this._config.volume_up.show)
            ? html`
                <div class="row">
                  ${this._renderButton(
                    "volume_mute",
                    "mdi:volume-mute",
                    "Volume Mute"
                  )}
                  ${this._renderButton(
                    "volume_down",
                    "mdi:volume-minus",
                    "Volume Down"
                  )}
                  ${this._renderButton(
                    "volume_up",
                    "mdi:volume-plus",
                    "Volume Up"
                  )}
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }

  protected updated(changedProps): void {
    if (!this._config) {
      return;
    }

    const oldHass = changedProps.get("hass");
    if (!oldHass || oldHass.themes !== this.hass!.themes) {
      applyThemesOnElement(this, this.hass!.themes, this._config.theme);
    }
  }

  static get styles(): CSSResult {
    return css`
      .remote {
        padding: 16px 0px 16px 0px;
      }
      img,
      paper-icon-button {
        width: 64px;
        height: 64px;
        cursor: pointer;
      }
      img {
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
    return this._config!.apps && this._config!.apps.length > index
      ? html`
          <img
            src=${this._config!.apps[index].image || ""}
            .app=${this._config!.apps[index].app}
            .config=${this._config!.apps[index]}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this._config!.apps[index].hold_action),
              hasDoubleTap: hasAction(
                this._config!.apps[index].double_tap_action
              )
            })}
          />
        `
      : html`
          <paper-icon-button></paper-icon-button>
        `;
  }

  private _renderButton(
    button: string,
    icon: string,
    title: string
  ): TemplateResult {
    return this._config![button] && this._config![button].show === false
      ? html`
          <paper-icon-button></paper-icon-button>
        `
      : html`
          <paper-icon-button
            .button=${button}
            icon=${icon}
            title=${title}
            @action=${this._handleAction}
            .actionHandler=${actionHandler({
              hasHold:
                this._config![button] &&
                hasAction(this._config![button].hold_action),
              hasDoubleTap:
                this._config![button] &&
                hasAction(this._config![button].double_tap_action)
            })}
          ></paper-icon-button>
        `;
  }

  private _handleAction(ev): void {
    const button = ev.currentTarget.button;
    const config = this._config![button] || ev.currentTarget.config;
    const app = ev.currentTarget.app;
    const remote = this._config!.remote
      ? this._config!.remote
      : "remote." + this._config!.entity.split(".")[1];

    handleAction(
      this,
      this.hass!,
      config && config.tap_action
        ? config
        : app
        ? {
            tap_action: {
              action: "call-service",
              service: "media_player.select_source",
              service_data: {
                entity_id: this._config!.entity,
                source: app
              }
            },
            ...config
          }
        : {
            tap_action: {
              service_data: {
                command: button,
                entity_id: remote
              },
              ...defaultRemoteAction
            }
          },
      ev.detail.action!
    );
  }
}
