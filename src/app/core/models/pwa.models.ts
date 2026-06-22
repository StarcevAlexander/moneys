export type InstallChoiceOutcome = 'accepted' | 'dismissed';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: InstallChoiceOutcome; platform: string }>;
  prompt(): Promise<void>;
}
