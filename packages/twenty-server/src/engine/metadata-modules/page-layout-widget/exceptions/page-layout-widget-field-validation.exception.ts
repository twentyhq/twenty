export class PageLayoutWidgetFieldValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageLayoutWidgetFieldValidationException';
  }
}
