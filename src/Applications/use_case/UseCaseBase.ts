export abstract class UseCaseBase<Input, Output> {
  abstract execute(payload: Input): Promise<Output>
}
