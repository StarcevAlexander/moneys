export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** Красная акцентная кнопка подтверждения для опасных действий. */
  danger?: boolean;
}
