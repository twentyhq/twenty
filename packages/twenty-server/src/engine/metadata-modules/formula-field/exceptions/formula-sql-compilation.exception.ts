export class FormulaSqlCompilationException extends Error {
  constructor({ message }: { message: string }) {
    super(message);
  }
}
