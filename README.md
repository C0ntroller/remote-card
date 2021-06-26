# 📡 Remote Card

A fork from [iantrich/roku-card](https://github.com/iantrich/roku-card) for a general remote/button card.

## Installation

**Requires Home Assistant 0.110.0 or above!**

Use [HACS](https://hacs.xyz) or follow this [guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)

```yaml
resources:
  url: /local/remote-card.js
  type: module
```

## Options

| Name        | Type      | Requirement  | Description                                                                                            |
| ----------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| type    | `string`  | **Required** | `custom:roku-card`                                                                                     |
| entity  | `string`  | **Required** | `remote` entity you want to use                                                                        |
| buttons | `list`    | **Required** | List of button rows [See button row options](#button-row-options)                                      |
| title   | `string`  | **Optional** | Card title                                                                                             |
| device  | `string`  | **Optional** | Device if your remote as learned commands for a specific device                                        |
| theme   | `string`  | **Optional** | Card theme                                                                                             |
| haptic  | `string`  | **Optional** | `none`, `success`, `warning`, `failure`, `light`, `medium`, `heavy`, `selection`. Default is `success` |



## button row Options
| Name              | Type     | Requirement  | Description                                                 |
| ----------------- | -------- | ------------ | ----------------------------------------------------------- |
| row               | `list`   | **Required** | Buttons for the row  [See button options](#button-options)  |

## button Options

| Name              | Type     | Requirement  | Description                                                 |
| ----------------- | -------- | ------------ | ----------------------------------------------------------- |
| empty             | `boolean`| **Required** | Creates an empty button (eg as placeholder)                 |

| Name              | Type      | Requirement  | Description                                                 |
| ----------------- | --------- | ------------ | ----------------------------------------------------------- |
| title             | `string`  | **Optional** | Title shown when hovered over the button                    |
| icon              | `string`  | **Optional** | Icon to use on the button                                   |
| image             | `string`  | **Optional** | Path to image to use for button; icon will be prioritized   |
| remote_command    | `string`  | **Optional** | A learned command for your remote                           |
| actions           | `map`     | **Optional** | Specify actions. Can have keys `tap_action`, `double_tap_action` and `hold_action`. For all see [See action options](#action-options) |

## action Options

| Name              | Type     | Default  | Supported options                                                        | Description                                                                                               |
| ----------------- | -------- | -------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `action`          | `string` | `toggle` | `more-info`, `toggle`, `call-service`, `none`, `navigate`, `url`         | Action to perform                                                                                         |
| `entity`          | `string` | none     | Any entity id                                                            | **Only valid for `action: more-info`** to override the entity on which you want to call `more-info`       |
| `navigation_path` | `string` | none     | Eg: `/lovelace/0/`                                                       | Path to navigate to (e.g. `/lovelace/0/`) when action defined as navigate                                 |
| `url_path`        | `string` | none     | Eg: `https://www.google.com`                                             | URL to open on click when action is `url`.                                                                |
| `service`         | `string` | none     | Any service                                                              | Service to call (e.g. `media_player.media_play_pause`) when `action` defined as `call-service`            |
| `service_data`    | `map`    | none     | Any service data                                                         | Service data to include (e.g. `entity_id: media_player.bedroom`) when `action` defined as `call-service`. |
| `haptic`          | `string` | none     | `success`, `warning`, `failure`, `light`, `medium`, `heavy`, `selection` | Haptic feedback for the [Beta IOS App](http://home-assistant.io/ios/beta)                                 |
| `repeat`          | `number` | none     | eg: `500`                                                                | How often to repeat the `hold_action` in milliseconds.                                                    |

## Minimal example

```yaml
type: custom:remote-card
title: TV
entity: remote.broadlink_remote
device: tv
buttons:
   - row:
        - icon: mdi:power
          title: Power
          remote_command: turn on
   - row:
        - icon: mdi:volume-mute
          title: Mute
          remote_command: volume mute
        - icon: mdi:volume-plus
          title: Volume up
          remote_command: volume up
        - icon: mdi:volume-minus
          title: Volume down
          remote_command: volume down
```

[Troubleshooting](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins)
