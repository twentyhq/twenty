export class PageLayoutWidgetGroupByValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageLayoutWidgetGroupByValidationException';
  }
}
