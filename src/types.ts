import { ActionConfig } from 'custom-card-helpers';

export interface RemoteCardConfig {
  type: 'custom:remote-card';
  entity: string;
  title?: string;
  device?: string;
  theme?: string;
  haptic?: string;
  buttons: RemoteButtonRow[];
}

export interface RemoteButtonRow {
  row: RemoteButton[];
}

export type RemoteButton = EmptyRemoteButton | ActionRemoteButton;

export interface ActionRemoteButton {
  icon?: string;
  image?: string;
  title?: string;
  remote_command?: string;
  actions?: {
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
  };
}

export interface EmptyRemoteButton {
  empty: true;
}
